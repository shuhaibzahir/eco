
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
                document.getElementById('admin-login').reset();
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
                    if(result.status){
                        $("#userCurrentStatus").val("Active").removeClass("btn-danger").addClass("btn-success");
                    }else{
                        $("#userCurrentStatus").val("Deactive").removeClass("btn-success").addClass("btn-danger");
                    }
                },
                error:function(err){
                    console.log(err)
                }
            })
}
 