
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

$("#cat-add-form-edit").submit(function(event){
  
    event.preventDefault();
    
    let form = $(this)
    $.ajax({
        url:"/admin/edit-category", 
        type:"Post",
        data:form.serialize(),
        success:function(d){ 
            
            if(d.status){
                document.getElementById('cat-add-form-edit').reset();
                window.location.href="/admin/category"
            }else{
                $("#cat-add-alert").html(d.msg)
            }
        },
        error:function(err){

        }
    })
})