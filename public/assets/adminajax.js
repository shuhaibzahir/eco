
// admin login

$("#admin-login").submit(function(event){
    event.preventDefault();
    let form = $(this)
    $.ajax({
        url:"/admin/login", 
        type:"Post",
        data:form.serialize(),
        success:function(d){ 
            console.log(d)
            if(d.status){
                
                window.location.href="/admin/dashboard"
            }else{
                $("#admin-login-alert").html(d.msg)
            }
        },
        error:function(err){

        }
    })
})

// change user status 
function changeStatus(id){
    $.ajax({
                url:"/admin/user/change-status",
                type:"post",
                data:{uid:id},
                success:function(result){
                    console.log(result)
                    if(result.status ==true){
                        $(`#${id}`).html("Active").removeClass("btn-danger").addClass("btn-success");
                    }else{
                        $(`#${id}`).html("Deactive").removeClass("btn-success").addClass("btn-danger");
                    }
                },
                error:function(err){
                    console.log(err)
                }
      })
}
 

 
$("#cat-add-form").submit(function(event){
  
    event.preventDefault();
    
    let form = $(this)
    $.ajax({
        url:"/admin/category/management", 
        type:"Post",
        data:form.serialize(),
        success:function(d){ 
            
            if(d.status){
                document.getElementById('cat-add-form').reset();
                window.location.href="/admin/category"
            }else{
                $("#cat-add-alert").html(d.msg)
            }
        },
        error:function(err){

        }
    })
})


// edit category
// cat-add-form-edit

$("#main-section-cat").submit(function(event){
  
    event.preventDefault();
    
    let form = $(this)
    $.ajax({
        url:"/admin/main-section", 
        type:"Post",
        data:form.serialize(),
        success:function(d){ 
            
            if(d.status){
                document.getElementById('main-section-cat').reset();
                window.location.href="/admin/cat-manage"
            }else{
                $("#maincat-add-alert").html(d.msg)
            }
        },
        error:function(err){

        }
    })
})

// /admin/add-subcat

$("#subCategory").submit(function(event){
  
    event.preventDefault();
    
    let form = $(this)
    $.ajax({
        url:"/admin/add-subcat", 
        type:"Post",
        data:form.serialize(),
        success:function(d){ 
              if(d.status){
                document.getElementById('subCategory').reset();
                window.location.href="/admin/cat-manage"
            }else{
                $("#cat-add-alert").html(d.msg)
            }
        },
        error:function(err){
            console.log(err)
        }
    })
})


function  changeOStatus(orderId, pId,val){
    // let statusValue = $("#val"+pId).val()
    console.log(orderId, pId,val)
    
    $.ajax({
        url: "/admin/change/order/status",
        type: "POST",
        data: {oId:orderId, proId:pId,value:val},
        success: function (result) {
        
             if(result.status){
                window.location.href="/admin/order-manage"
             }else{
                 alert("some issue")
             }
        },
        error: function (err) {
            console.log(err)
        }
    })
}


function cancelProduct(userid,oid , pid){
    let confrm  = confirm('Are you sure you want to proceed?' );
     
        if(confrm){
         $.ajax({
             url:"/admin/cancel/order/",
             type:'POST',
             data:{user:userid,order:oid,product:pid},
             success:function(result){
                if(result){
             
                    window.location.href="/admin/order-manage"
                }else{
                    alert("some error occured")
                }
             },
             error:function(err){
                console.log(err)
             }
         })
     }
}
