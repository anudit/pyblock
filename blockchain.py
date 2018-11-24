import hashlib
import json
from time import time
from urllib.parse import urlparse
from uuid import uuid4

import requests
from flask import Flask, jsonify, request

class Blockchain:
    def __init__(self):
        self.current_transactions = []
        self.chain = []
        self.nodes = []
        self.new_block(previous_hash='1', proof=100)

    def register_node(self, address):
        parsed_url = urlparse(address)
        if parsed_url.netloc:
            self.nodes.append(parsed_url.netloc)
        elif parsed_url.path:
            self.nodes.append(parsed_url.path)
        else:
            raise ValueError('Invalid URL')

    def valid_chain(self, chain):
        last_block = chain[0]
        current_index = 1

        while current_index < len(chain):
            block = chain[current_index]
            print(f'{last_block}')
            print(f'{block}')
            print("\n-----------\n")
            
            last_block_hash = self.hash(last_block)
            if block['previous_hash'] != last_block_hash:
                return False

            if not self.valid_proof(last_block['proof'], block['proof'], last_block_hash):
                return False

            last_block = block
            current_index += 1

        return True

    def resolve_conflicts(self):
        neighbours = self.nodes
        new_chain = None

        max_length = len(self.chain)
		
        for node in neighbours:
		    
            response = requests.get('http://'+node+'/chain')

            if response.status_code == 200:
                length = response.json()['length']
                chain = response.json()['chain']

                if length > max_length and self.valid_chain(chain):
                    max_length = length
                    new_chain = chain

        if new_chain:
            self.chain = new_chain
            return True

        return False

    def new_block(self, proof, previous_hash):
	
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time(),
            'transactions': self.current_transactions,
            'proof': proof,
            'previous_hash': previous_hash or self.hash(self.chain[-1]),
        }

        self.current_transactions = []

        self.chain.append(block)
        return block

    def new_transaction(self, sender, recipient, currency, amount):
        self.current_transactions.append({
            'sender': sender,
            'recipient': recipient,
            'amount': amount,
			'currency': currency,
        })

        return self.last_block['index'] + 1

    @property
    def last_block(self):
        return self.chain[-1]

    @staticmethod
    def hash(block):
        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

    def proof_of_work(self, last_block):
        last_proof = last_block['proof']
        last_hash = self.hash(last_block)

        proof = 0
        while self.valid_proof(last_proof, proof, last_hash) is False:
            proof += 1

        return proof

    @staticmethod
    def valid_proof(last_proof, proof, last_hash):
        guess = f'{last_proof}{proof}{last_hash}'.encode()
        guess_hash = hashlib.sha256(guess).hexdigest()
        return guess_hash[:4] == "0000"

		
app = Flask(__name__)
node_identifier = str(uuid4()).replace('-', '')

blockchain = Blockchain()

@app.route('/mine', methods=['GET'])
def mine():
    last_block = blockchain.last_block
    proof = blockchain.proof_of_work(last_block)

    blockchain.new_transaction(
        sender="0",
        recipient=node_identifier,
        amount=1,
		currency="ETH"
    )

    previous_hash = blockchain.hash(last_block)
    block = blockchain.new_block(proof, previous_hash)

    response = {
        'message': "New Block Forged",
        'index': block['index'],
        'transactions': block['transactions'],
        'proof': block['proof'],
        'previous_hash': block['previous_hash'],
    }
    return jsonify(response), 200


@app.route('/transactions/new', methods=['POST'])
def new_transaction():
    values = request.get_json()

    required = ['sender', 'recipient', 'amount', 'currency']
    if not all(k in values for k in required):
        return 'Missing values', 400

    index = blockchain.new_transaction(values['sender'], values['recipient'], values['amount'], values['currency'])

    response = {'message': f'Transaction will be added to Block {index}'}
    return jsonify(response), 201


@app.route('/chain', methods=['GET'])
def full_chain():
    response = {
        'chain': blockchain.chain,
        'length': len(blockchain.chain),
    }
    return jsonify(response), 200

@app.route('/chain/<int:block_id>', methods=['GET'])
def get_block(block_id):
	if (block_id < len(blockchain.chain)):
		response = {
			'chain': blockchain.chain[block_id],
		}
		return jsonify(response), 200
	else:
		return "Error: Invalid Index", 400

@app.route('/nodes', methods=['GET'])
def all_nodes():
    response = {
        'total_nodes': list(blockchain.nodes)
    }
    return jsonify(response), 200
	
@app.route('/nodes/delete/all', methods=['GET'])
def delete_all():
	blockchain.nodes.clear()
	response = {
		'success': True
	}
	return jsonify(response), 200

@app.route('/nodes/delete/<int:node_id>', methods=['GET'])
def delete_one(node_id):
	if (node_id+1 > len(blockchain.nodes)):
		response = {
			'success': False,
			'error': "Invalid Index"
		}
		return jsonify(response), 400
		
	if (blockchain.nodes.pop(node_id)):
		response = {
			'success': True
		}
		return jsonify(response), 200
	else:
		return "Error: Invalid Index", 400
		
@app.route('/nodes/add', methods=['POST'])
def register_nodes():
    values = request.get_json()

    nodes = values.get('nodes')
    if nodes is None:
        return "Error: Please supply a valid list of nodes", 400

    
    blockchain.register_node(nodes)

    response = {
        'message': 'New nodes have been added',
        'total_nodes': list(blockchain.nodes),
    }
    return jsonify(response), 201


@app.route('/nodes/merge', methods=['GET'])
def consensus():
    replaced = blockchain.resolve_conflicts()

    if replaced:
        response = {
            'message': 'Our chain was replaced',
            'new_chain': blockchain.chain
        }
    else:
        response = {
            'message': 'Our chain is authoritative',
            'chain': blockchain.chain
        }

    return jsonify(response), 200


if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument('-p', '--port', default=5000, type=int, help='port to listen on')
    args = parser.parse_args()
    port = args.port

    app.run(host='127.0.0.1', port=port)
