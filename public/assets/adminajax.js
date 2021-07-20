
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

  

function changeProductOffer(id){
    let productOrgianDiscount = $("#discount"+id)
    let oferPrize = $("#prize"+id)
    let productOffer = $(`#${id}`).val()
    let expDate = $("#uptodate"+id).val()
    console.log("this is date ", )
        if(expDate.length < 0){
            console.log("hai")
        }
    
        if(productOffer < 99 && productOffer > 0 && expDate.length !=0 ){
         $.ajax({
           url:'/admin/product-offer/add',
            type:'post',
            data:{pid:id,offer:productOffer,expOffer:expDate},
            success:function(result){
                $(`#${id}`).val("")
                    var prize = result.prize
                    var dicount = result.discount
                    productOrgianDiscount.html(dicount)
                    oferPrize.html(prize)
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: "Product Discount Updated",
                        showConfirmButton: true,
                       
                     }) 
            },
            error: function (err){
                console.log(err)
            }
        })
    }else if(expDate.length == 0 ){
        Swal.fire({
            position: 'center',
             title: "Please Enter Valid Date",
            showConfirmButton: true,
           
         }) 
    }else{
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: "Maximum 99% discount or chek Your input",
            showConfirmButton: true,
           
         }) 
    }
 
}

 function deleteProductOffer(id){
      let confirmation = confirm("Are You Sure ?")
      if(confirmation){

     
     $.ajax({
         url:"/admin/product-off/delete",
         data:{productId:id},
         type:"post",
         success:function (data){
            if(data.status){
                window.location.href="/admin/product-offer"
            }else{
                alert("some error")
            }
         },
         error:function (error){
             console.log(error)
         }
     })
    }
 }

 function deleteCategoryOffer(id){
     $.ajax({
         url:"/admin/catergory/delete/offer",
         type:"POST",
         data:{type:id},
         success:function(result){
            if(result){
                window.location.href="/admin/category/offer"
            }else{
                alert("some Problem")
            }
         },
         error:function (err){
             console.log(err)
         }
     })
 }


 $("#couponCreate").submit(function(event){
  
    event.preventDefault();
    
    let form = $(this)
     
    $.ajax({
        url:"/admin/create-coupen", 
        type:"Post",
        data:form.serialize(),
        success:function(d){ 
            if(d.status){
                window.location.href="/admin/create-coupen"
            }else{
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: d.msg,
                    showConfirmButton: true,
                   
                 }) 
            }
        },
        error:function(err){
            console.log(err)
        }
    })
})

 function deleteCoupon(id){
     let conf = confirm("are you sure?")
     if(conf){
         let dletedRow = $("#row"+id);
         $.ajax({
             url:"/admin/delete/coupon",
             method:"POST",
             data:{cid :id},
             success:function (d){
                dletedRow.css("display","none")
             },
             error:function(err){
                
             }
         })
     }
 }