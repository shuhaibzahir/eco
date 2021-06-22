// sign up form
$('#signup').submit(function(event){
       event.preventDefault();
    let form = $(this);
    // let action = $('#signup').attr('action');
    // event.preventDefault();
    $.ajax({
        url:'/signup',
        type:'POST',
        data:form.serialize(), 
        success:function(data){
            if(data.status){
                document.getElementById('signup').reset();
                window.location.href="/success"
                
            }else{
                $("#signup-alert").html(data.msg)
            }
        },
        error:function(err){
            console.log(err)
        }
    })
     
})

// sign in form
$("#signin").submit(function(event){
    event.preventDefault()
    let form = $(this);
     $.ajax({
         url:"/sign-in",
         type:"POST",
         data:form.serialize(),
         success:function(d) {
             console.log(d)
                if(d.status){
                    document.getElementById('signin').reset();
                    window.location.href="/success" 
                }else{
                    
                    $("#signin-alert").html(d.msg)
                }
         },
         error:function(err){
            console.log(err)
        }
     })
})

// otp submit 
$("#otp-loginForm").submit(function(event){
    event.preventDefault()
    let form = $(this);
     $.ajax({
         url:"/otp-login",
         type:"POST",
         data:form.serialize(),
         success:function(d) {
             console.log(d)
                if(d.status){
                document.getElementById('loginform2').addClass("active");
                }else{
                  $("#otpsending-alert").html(d.msg)   
                }
         },
         error:function(err){
            console.log(err)
        }
     })
})

// otp submiting
$("#otp-submitform").submit(function(event){
    event.preventDefault()
    let form = $(this);
     $.ajax({
         url:"/otp-submit",
         type:"POST",
         data:form.serialize(),
         success:function(result) {
            if(result.status){
                document.getElementById('otp-loginForm').reset();
                document.getElementById('otp-submitform').reset();
                window.location.href="/success"
            }else{
                $("#otpsubmiting-alert").html(result.msg)
            }
         },
         error:function(err){
            console.log(err)
        }
     })
})