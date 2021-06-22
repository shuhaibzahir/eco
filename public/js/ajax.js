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
                if(d.status){
                    document.getElementById('signup').reset();
                    window.location.href="/success" 
                }else{
                    $("#signup-alert").html(data.msg)
                }
         }
     })
})