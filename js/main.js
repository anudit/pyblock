var api = 'http://127.0.0.1:5000/'

function timeStamp(){var e=new Date,t=[e.getMonth()+1,e.getDate(),e.getFullYear()],n=[e.getHours(),e.getMinutes(),e.getSeconds()],o=n[0]<12?"AM":"PM";n[0]=n[0]<12?n[0]:n[0]-12,n[0]=n[0]||12;for(var r=1;r<3;r++)n[r]<10&&(n[r]="0"+n[r]);return t.join("/")+" "+n.join(":")+" "+o}

$(document).ready(function(){
    $("#refChain").click(function(){        
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
                //alert(result.responseJSON.chain[0])
                var myNode = document.getElementById("pane-1");
                while (myNode.firstChild) {
                    myNode.removeChild(myNode.firstChild);
                }
                for (var i = 0; i < result.responseJSON.chain.length; i++) {
                    console.log(result.responseJSON.chain[i])
                    card = $("<div class='card'><div class='card-content'><div class='content'><p>Index:"+result.responseJSON.chain[i].index+"<br />Transactions:"+result.responseJSON.chain[i].transactions+"<br />PoW:"+result.responseJSON.chain[i].proof+"<br />Previous Hash:"+result.responseJSON.chain[i].previous_hash+"<br />Time Stamp<time datetime='2016-1-1'> " +timeStamp(result.responseJSON.chain[i].timestamp) +" </time>");
                    card.append("</p></div></div></div>");

                    $('#pane-1').append(card);
                }
                
            }
        });
    });

    $("#mine").click(function(){        
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
                alert("Mined!")
            }
        });
    });
});
