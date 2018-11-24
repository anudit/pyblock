var api = 'http://127.0.0.1:5000/';

function timeStamp(){var e=new Date,t=[e.getMonth()+1,e.getDate(),e.getFullYear()],n=[e.getHours(),e.getMinutes(),e.getSeconds()],o=n[0]<12?"AM":"PM";n[0]=n[0]<12?n[0]:n[0]-12,n[0]=n[0]||12;for(var r=1;r<3;r++)n[r]<10&&(n[r]="0"+n[r]);return t.join("/")+" "+n.join(":")+" "+o}

function changePort(port, ini = 'http://127.0.0.1'){
  api = ini + ':' + port + '/';
};

function refreshStat(){
    var f = 0;
    $.ajax({
        url : api + 'chain',
        type : 'GET',
        dataType : 'json',
        success : function(code_html, status){
            $('#serverstat').removeClass("green");
            $('#serverstat').removeClass("red");

            $('#serverstat').addClass("green");
            $('#serverstat').text('Connected');
            f = 1;
        },
        error : function(result, status, error){
            $('#serverstat').removeClass("green");
            $('#serverstat').removeClass("red");

            $('#serverstat').addClass("red");
            $('#serverstat').text('Disconnected');
        },
        complete : function(result, status){
            //Materialize.toast('Status Updated!', 4000);
        }
    });
}

$(document).ready(function(){
    refreshStat();
    Materialize.toast('Ready', 4000);
    $('.collapsible').collapsible();

    $("#tabs_view").click(function(){
        refreshStat();
        $.ajax({
            url : api + 'chain',
            type : 'GET',
            dataType : 'json',
            success : function(code_html, status){
                res = 'success'
            },
            error : function(result, status, error){
                res = 'error'
            },
            complete : function(result, status){
                //Materialize.toast(result.responseJSON.chain[0])
                var myNode = document.getElementById("t_view");
                while (myNode.firstChild) {
                    myNode.removeChild(myNode.firstChild);
                }

                for (var i = 0; i < result.responseJSON.chain.length; i++) {
                    var transl = result.responseJSON.chain[i].transactions.length;
                    card = $("<div class='card hoverable'><div class='card-content'><span class='card-title activator grey-text text-darken-4' style='margin-top: 1px;'>Block # " + result.responseJSON.chain[i].index+"<i class='material-icons right'>search</i></span><p>Transactions: "+transl+"</p><p>PoW: "+result.responseJSON.chain[i].proof+"</p><p>Previous Hash: "+result.responseJSON.chain[i].previous_hash+"</p><p>Time Stamp: " +timeStamp(result.responseJSON.chain[i].timestamp) +" </p></div><div class='card-reveal'><span class='card-title grey-text text-darken-4'>Transaction Details<i class='material-icons right'>close</i></span></div></div>");
                    $('#t_view').append(card);
                }
            }
        });
    });

    $("#mine").click(function(){   
        refreshStat();     
        $.ajax({
            url : api + 'mine',
            type : 'GET',
            dataType : 'json',
            success : function(code_html, status){
                res = 'success'
            },
            error : function(result, status, error){
                res = 'error'
            },
            complete : function(result, status){
                Materialize.toast('Mined!', 4000);                
            }
        });
    });

    $("#tSub").click(function(){  
        refreshStat(); 
        var rec = $("#addtrans_add").val();
        var amt = $("#addtrans_amt").val();
        var cur = $("#addtrans_cur").val();

        var req = {
            "sender": "d4ee26eee15148ee92c6cd394edd974e",
            "recipient": rec ,
            "amount": amt, 
            "currency": cur
        }
        $.ajax({
            url: api+ 'transactions/new',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            success : function(code_html, status){
                Materialize.toast("success!",3000)
            },
            error : function(result, status, error){
                Materialize.toast("error!",3000)
            },
            complete : function(result, status){
                Materialize.toast("complete!",3000)
            },
            data: JSON.stringify(req)
        });
    });
	
	$("#btnAddNode").click(function(){
        apitest = $("#ipadd").val();
		f=0;
        $.ajax({
            url : apitest + 'chain',
            type : 'GET',
            dataType : 'json',
            success : function(code_html, status){
                //Materialize.toast('success');
				f=1;
            },
            error : function(result, status, error){
                Materialize.toast('error');
            },
            complete : function(result, status){
				if (f == 1){
					var req = {
						"nodes": apitest
					}
					$.ajax({
						url: api+ 'nodes/add',
						type: 'post',
						dataType: 'json',
						contentType: 'application/json',
						success : function(code_html, status){
							//Materialize.toast("success!",3000)
						},
						error : function(result, status, error){
							Materialize.toast("error!",3000)
						},
						complete : function(result, status){
							Materialize.toast("Registered!",3000)
							$('#nodeList').append("<li class='collection-item'><div> " +  apitest + "<a class='secondary-content'><i class='material-icons red-text'>do_not_disturb</i></a></div></li>");
						},
						data: JSON.stringify(req)
					});
				}
            }
        });
    });
	
	$("#btnDisconnectNodes").click(function(){   
        refreshStat();     
        $.ajax({
            url : api + 'delete/all',
            type : 'GET',
            dataType : 'json',
            success : function(code_html, status){
                res = 'success'
            },
            error : function(result, status, error){
                res = 'error'
            },
            complete : function(result, status){
                Materialize.toast('Disconnected From all Nodes!', 4000);                
            }
        });
    });
	
	$("#btnMergeNodes").click(function(){   
        refreshStat();     
        $.ajax({
            url : api + 'nodes/merge',
            type : 'GET',
            dataType : 'json',
            success : function(code_html, status){
                res = 'success'
            },
            error : function(result, status, error){
                res = 'error'
            },
            complete : function(result, status){
                Materialize.toast('Merged From all Nodes!', 4000);                
            }
        });
    });


    $("#serverstat").click(function(){
        refreshStat();
    });
});

