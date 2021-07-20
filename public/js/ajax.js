// sign up form
$('#signup').submit(function (event) {
    event.preventDefault();
    let form = $(this);
    // let action = $('#signup').attr('action');
    // event.preventDefault();
    $.ajax({
        url: '/signup',
        type: 'POST',
        data: form.serialize(),
        success: function (data) {
            if (data.status) {
                document.getElementById('signup').reset();
                window.location.href = data.url || "/"

            } else {
                $("#signup-alert").html(data.msg)
            }
        },
        error: function (err) {
            console.log(err)
        }
    })

})

// sign in form
$("#signin").submit(function (event) {
    event.preventDefault()
    let form = $(this);
    $.ajax({
        url: "/sign-in",
        type: "POST",
        data: form.serialize(),
        success: function (d) {
            console.log(d)
            if (d.status) {
                document.getElementById('signin').reset();
                window.location.href = d.url || "/"
            } else {

                $("#signin-alert").html(d.msg)
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
})

// otp submit attempt
$("#otp-loginForm").submit(function (event) {
    event.preventDefault()
    let form = $(this);
    $.ajax({
        url: "/otp-login",
        type: "POST",
        data: form.serialize(),
        success: function (d) {
            console.log(d)
            if (d.status) {
                $('#loginform2').addClass("active");
            } else {
                $("#otpsending-alert").html(d.msg)
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
})

// otp submiting
$("#otp-submitform").submit(function (event) {
    event.preventDefault()
    let form = $(this);
    $.ajax({
        url: "/otp-submit",
        type: "POST",
        data: form.serialize(),
        success: function (result) {
            if (result.status) {
                document.getElementById('otp-loginForm').reset();
                document.getElementById('otp-submitform').reset();
                window.location.href = result.url||"/"
            } else {
                $("#otpsubmiting-alert").html(result.msg)
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
})


// cart adding
$("#cartAdding").submit(function (event) {
    event.preventDefault()
    let form = $(this);
    $.ajax({
        url: "/addto-cart",
        type: "POST",
        data: form.serialize(),
        success: function (result) {
            if (result.status == "already") {
               
             Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Successfuly Added',
                    showConfirmButton: false,
                    timer: 1500
                })
            } else if (result.status == "new") {
                let cartValue = parseInt($("#count").html())
                $("#count").html(cartValue + 1)
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Successfuly Added to cart',
                    showConfirmButton: false,
                    timer: 1500
                })
            } else if (result.status == "notLoginned") {
                window.location.href = "/login"
            }
        },
        error: function (err) {
            console.log(err)
        }
    })
})

function addingCart(id){
         $.ajax({
            url: "/addto-cart",
            type: "POST",
            data: {productID:id},
            success: function (result) {
                if (result.status == "already") {
                   
                 Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'Successfuly Added 1 Qty',
                        showConfirmButton: false,
                        timer: 1500
                    })
                } else if (result.status == "new") {
                    let cartValue = parseInt($("#count").html())
                    $("#count").html(cartValue + 1)
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'Successfuly Added New Item',
                        showConfirmButton: false,
                        timer: 1500
                    })
                } else if (result.status == "notLoginned") {
                    window.location.href = "/login"
                }else if(result.status =="Noqty"){
                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: 'No More Quanity',
                        showConfirmButton: false,
                        timer: 1500
                    })
                }
            },
            error: function (err) {
                console.log(err)
            }
        })
    
}

function changeQty(qty,id,max){
    console.log(id)
    console.log(qty)
    let pid = id;
    let Qty = qty;
    let currentQty = $("#qty"+pid).val();
     let maxQty = max;
     if(qty==1&&currentQty==max){
        alert("max quantity")
     }else{
        $.ajax({
            url: "/cart/item/qty/chng",
            type: "POST",
            data: {productId:pid, Quantity:Qty},
            success: function (result) {
                  if(result.status){
                      console.log(result)
                    $("#qty"+pid).val(result.qty)
                    let price = $("#prize"+pid).html();
                    let total = parseInt(price)*parseInt(result.qty)
                    $("#total"+pid).html(total)
                    let subTotal = $("#subTotal").html()
                    let referal = $("#referal").html()
                    if(!referal){
                        referal =0
                        console.log("dsafjkadjh")
                    }
                    let newSubTotal;
                     if(Qty == -1){
                        newSubTotal = parseInt(subTotal)-parseInt(price)-parseInt(referal)
                        $("#subTotal").html(newSubTotal)
                     }else{
                         newSubTotal = parseInt(subTotal)+parseInt(price)-parseInt(referal)
                        $("#subTotal").html(newSubTotal) 
                     }
                    if(result.qty !=1){
                          $("#decBtn"+pid).css("display","block")
                      }else{
                        $("#decBtn"+pid).css("display","none") 
                     }
                     if(newSubTotal > 3000){
                         let gdTotal = newSubTotal ;
                         $("#grandTotal").html(gdTotal)
                         $('#shipping').html('<i class="fas fa-shipping-fast"></i>  Free Shipping').css("color","green")
                     }else{
                        let gdTotal = newSubTotal +120 ;
                        $("#grandTotal").html(gdTotal)
                        $('#shipping').html('<i class="fas fa-shipping-fast"></i>  Shipping Charge ₹ 120').css("color","red")
                     }

                 }else{
                    window.location.href = "/login"
                 }
            },
            error: function (err) {
                console.log(err)
            }
        })
     }
         
     
}
 
  function checkAddress(id){
       
        let addname = $("#addname")
        let first = $("#first")
        let last = $("#last")
        let houseno = $("#houseno")
        let addressfull = $("#addressfull")
        let town = $("#town")
        let state = $("#state")
        let zipcode = $("#zipcode")
        let phone = $("#phone")
        let saveAdd = $("#saveAdd")
        let addSelect =$("#addSelect").val()
        console.log(addSelect)
       if(addSelect=='false'){
        addname.val("")
        first.val("" )
        last.val("")
        houseno.val("")
        addressfull.val("")
        town.val("")
        state.val("")
        zipcode.val("")
        phone.val("")
        saveAdd.css('display','block')
       }else{
        $.ajax({
            url: "/get-address",
            type: "POST",
            data: {uid:id, addName:addSelect},
            success: function (a)  {
                if (a.status) {
                    console.log(a)
                    addname.val(a.d.AddressName)
                    first.val(a.d.FirstName )
                    last.val(a.d.LastName )
                    houseno.val(a.d.HouseNo )
                    addressfull.val(a.d.Address )
                    town.val(a.d.Town )
                    state.val(a.d.State )
                    zipcode.val(a.d.Pincode)
                    phone.val(a.d.Phone)
                    saveAdd.css('display','none')
   
                } else  {
    
                }
                     
                 
            },
            error: function (err) {
                console.log(err)
            }
        })
       }
        
    } 

 

 
$("#userProfile").submit(function (event) {
    event.preventDefault()
    let form = $(this);
    $.ajax({
        url: "/user/update/profile",
        type: "POST",
        data: form.serialize(),
        success: function (result) {
            if (result.status ) {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: "Successfuly Updated",
                    showConfirmButton: true,
                   
                }).then(()=>{
                    window.location.href = "/myaccount"
                })
               
             
            } else {
                
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: result.msg,
                    showConfirmButton: true,
                   
                })
            } 
        },
        error: function (err) {
            console.log(err)
        }
    })
})

// order cancel

function cancelProduct(oid , pid){
    let confrm  = confirm('Are you sure you want to proceed?' );
     
        if(confrm){
         $.ajax({
             url:"/user/order/cancel",
             type:'POST',
             data:{order:oid,product:pid},
             success:function(result){
                if(result){
             
                    window.location.href="/myaccount"
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

function disableAll(){
    var mainForm = document.getElementById("check_out");
    var allInput = mainForm.getElementsByTagName("input")
    allInput.forEach(function(item){
    item.setAttribute('disabled',true)
     })
 }

$("#check_out").submit(function (event) {
    event.preventDefault()
     let form = $(this);
    $.ajax({
        url: "/checkout",
        type: "POST",
        data: form.serialize(),
        success: function (result) {
            disableAll()
            if (result.status == "cash" ) {
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: "Ordered Successfully",
                    showConfirmButton: false,
                    timer: 3000
                   
                })
                setTimeout(() => {
                    window.location.href = "/payment/success"
                }, 3000);
             
            } else if(result.status == "Razorpay"){
               console.log(result.key, result.payment)
               orderPay(result.payment, result.key,result.user)
            } else{
                console.log(result.paypalUrl)
                window.location.href =  result.paypalUrl
            }
            

 
        },
        error: function (err) {
            console.log(err)
        }
    })
 

})
 
function  orderPay(payment, key,user){
 
     
     var options = {

        "key": key, // Enter the Key ID generated from the Dashboard
        "amount": payment.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Zeebra Cross",
        "description": "Purchase Payment",
        "image": `/public/images/userimage/${user.uid}.jpg`,
        "order_id": payment.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            
            verifyPayment(response,payment)
        },
        "prefill": {
            "name": `${user.name}`,
            "email": `${user.email}`,
            "contact": `${user.phone}`
        },
        "notes": {
            "address": "Zeebracross Shopping Hub"
        },
        "theme": {
            "color": "#cf8700"
        },
        "modal": {
            "ondismiss": function(){
                paymentFailed()
            }
        }
    }; 
    
    var rzp1 = new Razorpay(options);
    rzp1.open();
    rzp1.on('payment.failed', function (response){
         paymentFailed()
    });
    

}
function  verifyPayment(response, payments){
 
    $.ajax({
        url:"/verify-payment",
        data:{response,payments},
        type:"POST",
        success:function(response){
            if(response.pyst){
                window.location.href="/payment/success"
             
            }else{
                alert(response.msg)
            }
        }

    })
}

function paymentFailed(){
    $.ajax({
        url:"/failed-payment",
        type:"POST",
        success:function(response){
            if(response.status){
                   
             Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'Payment Not Completed Order Failed',
                showConfirmButton: true,
               
             }).then(()=>{
                window.location.href="/view-cart"
             })
               
             
            }else{
                alert(response.msg)
            }
        }

    })
}



$("#forgotpass").submit(function (event) {
    event.preventDefault()
     let form = $(this);
   
    $.ajax({
        url: "/forgot-password",
        type: "POST",
        data: form.serialize(),
        success: function (result) {
            if(result.status){
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Reset link sent to your email',
                    showConfirmButton: true,
                   
                 }).then(()=>{
                    window.location.href="/login"
                 })
            }else{
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: result.msg,
                    showConfirmButton: true,
                   
                 }).then(()=>{
                    window.location.href="/login"
                 })
            }
         },
        error: function (err) {
            console.log(err)
        }
    })
 

})

 

$("#password-reset").submit(function (event){
    event.preventDefault();
    let form = $(this);
    let newPassword  = $("#newPass").val()
    let confirmPass = $("#cPass").val()
    if(newPassword == confirmPass){
    $.ajax({
        url:"/reset-password",
        type:"post",
        data:form.serialize(),
        success:(result)=>{
            if(result){
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Your Password changed',
                    showConfirmButton: true,
                   
                 }).then(()=>{
                    window.location.href="/login"
                 })
            }else{
                window.location.href="/login"
            }
        },
        error:(err)=>{
            console.log(err)
        }
    })
}else{
    $("#errpass").html("!password doesn't match")
}
})

$("#changePassword").submit(function(event){
    event.preventDefault();
    let form = $(this);
   var newpass = $("#newpass").val()
   var cpass = $("#cpass").val()
   var oldpass = $("#oldpass")
    if(newpass == cpass){
    $("#change-pass-cancle").trigger({ type: "click" });
    $.ajax({
        url: "/user-pass/change",
        type: "POST",
        data: form.serialize(),
        success: function (result) {
            if(result.status){
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Password successfully changed',
                    showConfirmButton: true,
                   
                 }) 
            }else{
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: result.msg,
                    showConfirmButton: true,
                   
                 }) 
            }
        },
        erro:function(err){
            console.log(err)
        }
    })
             
   } else{
       $("#erroralert").html("! Password not match ")
   }
    
})

function submitCoupon(){
    let coupon = $("#coupon_code").val()
    let coupApplied = $("#coupen_discount")
    let grandTotal = $("#grandtotal")
    let couponRow = $("#coupenrow")
    let couponAlert = $("#couponalert")
    $.ajax({
        url:"/coupon-chek",
        type:"GET",
        data:{code:coupon},
        success:function(result){
        
            if(result.status){
                couponAlert.html("")
                coupApplied.html(`₹ ${result.off}`)
              let grand=  parseInt(grandTotal.html())-parseInt(result.off)
              grandTotal.html(grand)
              couponRow.show()
             }else{
                 couponAlert.html(result.msg)
             }
        },
        error:function (error){
            console.log(error)
        }
    })

     
}