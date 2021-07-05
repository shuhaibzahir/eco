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
                window.location.href = "/"

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
                window.location.href = "/"
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
                window.location.href = "/"
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
                    $("#qty"+pid).val(result.qty)
                    let price = $("#prize"+pid).html();
                    let total = parseInt(price)*parseInt(result.qty)
                    $("#total"+pid).html(total)
                    let subTotal = $("#subTotal").html()
                    let newSubTotal;
                     if(Qty == -1){
                        newSubTotal = parseInt(subTotal)-parseInt(price)
                        $("#subTotal").html(newSubTotal)
                     }else{
                         newSubTotal = parseInt(subTotal)+parseInt(price)
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
                        $('#shipping').html('<i class="fas fa-shipping-fast"></i>  Shipping Charge ₹ 50').css("color","red")
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
                window.location.href = "/myaccount"
             
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