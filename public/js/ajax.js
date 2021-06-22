// sign up form
$('#signup').submit(function(event){
       event.preventDefault();
    let form = $(this);
    let action = $('#signup').attr('action');
    // event.preventDefault();
    $.ajax({
        url:action,
        type:'POST',
        data:form.serialize(), 
        success:function(data){
            console.log(data)
        },
        error:function(err){
            console.log(err)
        }
    })
     
})