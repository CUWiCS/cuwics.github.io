$(function() {

    $("input,textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            // get values from FORM
            $('#success').html('<img id="loading-gif" src="img/sending2.gif" alt="Sending" title="Sending"/>');
            var name = $("input#name").val();
            var email = $("input#email").val();
            var phone = $("input#phone").val();
            var message = $("textarea#message").val();
            console.log($("#inquiry-type label.active input").val());
            var firstName = name; // For Success/Failure Message
            // Check for white space in name for Success/Fail message
            if (firstName.indexOf(' ') >= 0) {
                firstName = name.split(' ').slice(0, -1).join(' ');
            }
            var inquiry_type = $("#inquiry-type label.active input").val();
            var email_add;
            var cc;
            if (inquiry_type=="listserv") {
                email_add = "aqs2104@columbia.edu"; //Annie (current publicity chair)
                cc = "elh2157@barnard.edu"; //old publicity chair
            } else if (inquiry_type=="company") {
                email_add = "xiao.lim@columbia.edu"; //Xiao L (current corporate chairs)
                cc = "ls3389@barnard.edu"; //Lucille (current president)
                cc = "elh2157@barnard.edu";
            } else if (inquiry_type=="anything_else") {
                email_add = "aqs2104@columbia.edu"; // Annie (current publicity chair)
                cc = "elh2157@barnard.edu";
                
            }

            $.ajax({
                url: "//formspree.io/"+email_add,
                type: "POST",
                dataType: "json",
                data: {
                    Name: name,
                    Phone: phone,
                    Email: email,
                    Message: message,
                    _cc: ""
                },
                cache: false,
                success: function(event) {
                    console.log(event);
                    // Success message
                    $('#success').empty();
                    $('#success').html("<div class='alert alert-success'>");
                    $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-success')
                        .append("<strong>Your message has been sent. </strong>");
                    $('#success > .alert-success')
                        .append('</div>');

                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
                error: function() {
                    // Fail message
                    $('#success').empty();
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-danger').append("<strong>Sorry " + firstName + ", it seems that my mail server is not responding. Please try again later!");
                    $('#success > .alert-danger').append('</div>');
                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });

    $("a[data-toggle=\"tab\"]").click(function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
});


/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
    $('#success').html('');
});
