
function _0x278a(){const _0xa39993=['17981617263','2IqsFAq','4556035JuWWFN','370630YukHQT','AIzaSyBVS0USwTjIiAhhk0OPkOpJx2ov-kDc73A','docube-sarvadhi','5945876dwvLMm','9LrLWyg','1208111IbfdrN','4038318fZRuSZ','7aNCluP','5609832XZDmuw','docube-sarvadhi.firebaseapp.com','3202605lejaLA','484ptijSj','1:17981617263:web:87dfc45e227d38c601c99a'];_0x278a=function(){return _0xa39993;};return _0x278a();}const _0x2eb8a3=_0xfacb;(function(_0x4daf12,_0x161335){const _0x430333=_0xfacb,_0x3b7b5e=_0x4daf12();while(!![]){try{const _0x10dd46=parseInt(_0x430333(0x117))/0x1*(parseInt(_0x430333(0x120))/0x2)+-parseInt(_0x430333(0x11c))/0x3+parseInt(_0x430333(0x115))/0x4+parseInt(_0x430333(0x121))/0x5+-parseInt(_0x430333(0x118))/0x6*(parseInt(_0x430333(0x119))/0x7)+parseInt(_0x430333(0x11a))/0x8*(parseInt(_0x430333(0x116))/0x9)+parseInt(_0x430333(0x122))/0xa*(-parseInt(_0x430333(0x11d))/0xb);if(_0x10dd46===_0x161335)break;else _0x3b7b5e['push'](_0x3b7b5e['shift']());}catch(_0x54ce8a){_0x3b7b5e['push'](_0x3b7b5e['shift']());}}}(_0x278a,0xe46e8));function _0xfacb(_0x458a9b,_0x4c1fa0){const _0x278a80=_0x278a();return _0xfacb=function(_0xfacb31,_0x501ae2){_0xfacb31=_0xfacb31-0x114;let _0xc0e70f=_0x278a80[_0xfacb31];return _0xc0e70f;},_0xfacb(_0x458a9b,_0x4c1fa0);}const firebaseConfig={'apiKey':_0x2eb8a3(0x123),'authDomain':_0x2eb8a3(0x11b),'projectId':_0x2eb8a3(0x114),'storageBucket':'docube-sarvadhi.appspot.com','messagingSenderId':_0x2eb8a3(0x11f),'appId':_0x2eb8a3(0x11e),'measurementId':'G-LGYGS1SWS0'};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

document.addEventListener("DOMContentLoaded", function () {
    const phoneNoForm = document.getElementById('phoneNoForm');
    const otpForm = document.getElementById('otpForm');
    const phoneNoInput = document.getElementById('phoneNo');
    const otpInput = document.getElementById('otp');
    const recaptchaContainer = document.getElementById('recaptcha-container');
    let confirmationResult;
    let appVerifier;

    $("#phoneNo").intlTelInput({
        initialCountry: "in",
        separateDialCode: true,
    });

    // Function to handle phone number form submission
    const handlePhoneNoSubmit = async (e) => {
        e.preventDefault();
        try {
            // Disable the button
            const sendOtpButton = document.querySelector('.send-otp-btn');
            sendOtpButton.disabled = true;

            const countryCode = $("#phoneNo").intlTelInput("getSelectedCountryData").dialCode;
            const phoneNumber = phoneNoInput.value.trim();
            const fullPhoneNumber = "+" + countryCode + phoneNumber;

            if (!appVerifier) {
                appVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainer, {
                    size: 'invisible',
                    callback: () => {
                        console.log('reCAPTCHA resolved..');
                    }
                });
            }

            // Sign in with the provided phone number
            const confirmation = await firebase.auth().signInWithPhoneNumber(fullPhoneNumber, appVerifier);
            confirmationResult = confirmation;
            otpForm.style.display = 'block';
            phoneNoForm.style.display = 'none';

        } catch (error) {
            console.error('Error sending verification code: ', error);
        }
        // finally {
        //     // Enable the button regardless of success or failure
        //     sendOtpButton.disabled = false;
        // }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        try {
            const verifyotpbtn = document.querySelector('.verify-otp-btn');
            verifyotpbtn.disabled = true;
            var code = document.getElementById('otp').value;
            var otpError = document.getElementById('otpError');
            const result = await confirmationResult.confirm(code);
            const user = result.user;
            if (user) {
                console.log('User Logged In Successfully:', user);
                const countryCode = $("#phoneNo").intlTelInput("getSelectedCountryData").dialCode;
                const phoneNumber = "+" + countryCode + phoneNoInput.value.trim();
                localStorage.setItem('phoneNumber', phoneNumber);
                $("#mybooking").css("display", "none");
                $("#mybookingres").css("display", "none");

                setTimeout(() => {
                    localStorage.removeItem("phoneNumber");
                    $("#mybooking").css("display", "none");
                    $("#mybookingres").css("display", "none");
                }, 7 * 24 * 60 * 60 * 1000);

                changeType();
            } else {
                console.error('User object is undefined');
            }
        } catch (error) {
            console.error('Error verifying OTP: ', error);
            const verifyotpbtn = document.querySelector('.verify-otp-btn');
            if (error.code == "auth/invalid-verification-code") {
                const otpError = document.getElementById('otpError'); // Get the element by its id
                if (otpError) {
                    otpError.textContent = 'Please enter a Valid OTP'; // Set error message
                    verifyotpbtn.disabled = false;
                }
            }
            if (error.code == "auth/code-expired") {
                console.log("code-expired");
            }
        }
    };

    // Function to initialize reCAPTCHA verifier
    const initializeRecaptcha = () => {
        if (!appVerifier) {
            appVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainer, {
                size: 'invisible',
                callback: () => {
                    console.log('reCAPTCHA resolved..');
                }
            });
        }
    };

    function clearFields() {
        console.log("1");
        $("#sendotp").css("display", "block");
        var fields = document.querySelectorAll('.otp-text-field');
        fields.forEach(function (field) {
            field.value = ''; // Clear the value of each input field
        });
    }

    // Function to handle resend OTP button click
    const handleResendOTP = async () => {
        try {
            initializeRecaptcha(); // Initialize reCAPTCHA
            const countryCode = $("#phoneNo").intlTelInput("getSelectedCountryData").dialCode;
            const phoneNumber = "+" + countryCode + phoneNoInput.value.trim();
            const confirmation = await firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier);
            confirmationResult = confirmation;
        } catch (error) {
            console.error('Error sending verification code: ', error);
        }
    };



    phoneNoForm.addEventListener('submit', handlePhoneNoSubmit);
    otpForm.addEventListener('submit', handleOtpSubmit);
    document.getElementById('resendOTP').addEventListener('click', function () {
        clearFields();
        handleResendOTP();
    });
});



let digitValidate = function (ele) {
    ele.value = ele.value.replace(/[^0-9]/g, "").substring(0, 1);
};

const inputs = document.querySelectorAll(".otp-text-field");
inputs.forEach((input, index1) => {
    input.addEventListener("keyup", (e) => {
        const currentInput = input,
            nextInput = input.nextElementSibling,
            prevInput = input.previousElementSibling;
        if (currentInput.value.length > 1) {
            currentInput.value = "";
            return;
        }
        if (
            nextInput &&
            nextInput.hasAttribute("disabled") &&
            currentInput.value !== ""
        ) {
            nextInput.removeAttribute("disabled");
            nextInput.focus();
        }
        if (e.key === "Backspace") {
            inputs.forEach((input, index2) => {
                if (index1 <= index2 && prevInput) {
                    input.setAttribute("disabled", true);
                    input.value = "";
                    prevInput.focus();
                }
            });
        }
    });
});
window.addEventListener("load", () => inputs[0].focus());
const otp = document.querySelectorAll(".otp-text-field");
otp.forEach((input, index) => {
    input.setAttribute("oninput", "digitValidate(this)");
    input.setAttribute("onkeyup", `tabChanges(event, ${index})`);
});
function tabChanges(event, index) {
    console.log(
        `Tab change event triggered for input field with index: ${index}`
    );
    if (event.key === "Enter" || event.key === "ArrowRight") {
        if (otp[index + 1]) {
            otp[index + 1].focus();
        }
    } else if (event.key === "ArrowLeft") {
        if (otp[index - 1]) {
            otp[index - 1].focus();
        }
    }
}
const combinedInput = document.getElementById("otp");
otp.forEach((input) => {
    input.addEventListener("input", function () {
        let combinedValue = "";
        otp.forEach((input) => {
            combinedValue += input.value;
        });
        combinedInput.value = combinedValue;
    });
    input.addEventListener("keyup", function (event) {
        if (event.key === "Backspace") {
            const index = Array.from(otp).indexOf(input);
            if (index > 0) {
                otp[index - 1].focus();
            }
        } else if (event.key.length === 1) {
            const index = Array.from(otp).indexOf(input);
            if (index < otp.length - 1) {
                otp[index + 1].focus();
            }
        }
    });
});

document.getElementById('otpForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const firstNameData = document.getElementById('patientName').value.trim();
    const phoneNumberData = document.getElementById('phoneNo').value.trim(); // Fixed the ID here

    const createPatientUrl = 'https://ccapi.continuouscare.in/e-api/v1.0/administration/patient/create';
    const searchPatientUrl = 'https://api.continuouscare.in/e-api/v1.0/administration/patient/search';

    const createPatientData = {
        virtualPracticeId: "298141aa-14f8-45bb-9b7d-3957332c8fb4",
        firstName: firstNameData,
        lastName: "",
        dateOfBirth: "01/01/1970",
        extId: "-" + phoneNumberData,
        phoneNumber: phoneNumberData,
        phoneCallingCode: "+91"
    };

    fetch(createPatientUrl, {
        method: 'POST',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(createPatientData)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Patient created:", data);

            return fetch(searchPatientUrl, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orgId: '298141aa-14f8-45bb-9b7d-3957332c8fb4',
                    searchString: phoneNumberData
                })
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.patients.length === 0) {
                console.log("No patient found with the provided search string.");
                return;
            }

            const uuid = data.patients[0].uuid;
            localStorage.setItem('uuid', uuid);
            console.log();
            console.log("Patient found:", data.patients[0]);
        })

        .catch(error => {
            console.error('Error:', error);
        });
});

document.getElementById("book-appointment-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get the value of the input field
    var patientName = document.getElementById("patientName").value;

    // Save the value to local storage
    localStorage.setItem("patientName", patientName);

});



document.addEventListener('DOMContentLoaded', function () {
    const patientName = localStorage.getItem('patientName');
    const patientNameInput = document.getElementById('patientName');

    if (patientName) {
        patientNameInput.value = patientName;
        patientNameInput.disabled = true;
    } else {
        // If fullName doesn't exist in localStorage, input remains active
        patientNameInput.disabled = false;
    }
});


function changeType() {
    var loginFormBox = document.getElementById("loginformbox");

    loginFormBox.style.display = "none";

    var loadButtons = document.getElementsByClassName("load");
    for (var i = 0; i < loadButtons.length; i++) {
        loadButtons[i].click(); // Trigger click event on each load button
    }
}

// book appointment form Error and Remove Function
$(document).ready(function () {
    function clearErrors() {
        $("#patient-box-error, #location-box-error, #select-box-error, #date-box-error").text("");
        $("#radio-box-error").text("");
    }

    $("input, select").on("input", function () {
        $(this).next(".error").text("");
    });

    $("#datebox").on("change", function () {
        var datebox = $("#datebox");
        if (datebox.val() != "") {
            $("#date-box-error").text("");
            console.log(datebox.val());
        }
        console.log(datebox.val());
    });

    $(document).on("change", 'input[type="radio"]', function () {
        console.log("print");
        var timeslot = $(".timeslotinput");
        if ($(".timeslotinput").is(":checked")) {
            $("#radio-box-error").text("");
            console.log(timeslot.val());
        }
        console.log(timeslot.val());
    });


    $("#book-appointment-button").click(function (e) {
        e.preventDefault(); // Prevent default form submission
        var errors = false; // Flag to track errors
        var patientname = $("#patientName").val();
        var location = $("#locationBox").val();
        var service = $("#selectBox").val();
        var datebox = $("#datebox").val();
        var storedPhoneNumber = localStorage.getItem("phoneNumber");
        var appointmentbutton = document.getElementsByClassName("load");

        clearErrors(); // Clear any previous errors

        // Validate patient name, location, service, and date
        if (patientname === "") {
            console.log("patientname");
            $("#patient-box-error").text("Please enter patient name");
            console.log("patientname-1");
            errors = true;
            console.log("patientname-2");
        }
        if (location === null) {
            console.log("location");
            $("#location-box-error").text("Please select a location");
            console.log("location-1");
            errors = true;
            console.log("location-2");
        }
        if (service === null) {
            console.log("service");
            $("#select-box-error").text("Please select a service");
            console.log("service-1");
            errors = true;
            console.log("service-2");
        }
        if (datebox === "") {
            $("#date-box-error").text("Please select a date");
            errors = true;
        }

        // Check if all fields are filled and storedPhoneNumber is null

        if (errors === false) {
            if (!$(".timeslotinput").is(":checked")) {
                $("#radio-box-error").text("Please select a time slot");
                errors = true;
            }

        }

        // Check if all fields are filled and storedPhoneNumber is null
        if (errors === false && storedPhoneNumber === null) {
            console.log(1);
            $("#loginformbox").css("display", "block");
            errors = true;
        }

        if (errors === false) {
            $("#appointment-form").submit();
            for (var i = 0; i < appointmentbutton.length; i++) {
                appointmentbutton[i].click(); // Trigger click event on each load button
            }
        }
    });
});


function submitbtn() {
    var mybooking = document.getElementById("mybooking");
    var dataloader = document.getElementById("dataloader");
    var appointmentsuccess = document.getElementById("appointment-success-data");

    // Check if mybooking is initially set to display: block
    if (getComputedStyle(mybooking).display === "flex") {
        // Check if any form field is blank
        var formFields =
            document.forms["book-appointment-form"].getElementsByTagName("input");
        var radioButtons = document.querySelectorAll(
            "input[type='radio'][name='timeslot']"
        );
        var allFieldsFilled = true;

        // Check if any text input is blank
        for (var i = 0; i < formFields.length; i++) {
            if (formFields[i].type === "text" && formFields[i].value === "") {
                allFieldsFilled = false;
                break;
            }
        }

        // Check if any radio button is checked
        var anyRadioChecked = false;
        for (var j = 0; j < radioButtons.length; j++) {
            if (radioButtons[j].checked) {
                anyRadioChecked = true;
                break;
            }
        }

        // If no radio button is checked, set allFieldsFilled to false
        if (!anyRadioChecked) {
            allFieldsFilled = false;
        }

        if (allFieldsFilled) {
            setTimeout(function () {
            }, 4000);
        } else {
            console.log("Please fill in all required fields.");
        }
    }
}

document.getElementById("selectBox").addEventListener("change", function () {
    var selectedValue = this.value;
    var video = document.getElementById("video");
    var consultation = document.getElementById("consultation");

    if (selectedValue === "Video Consultation") {
        video.style.display = "flex";
        consultation.style.display = "none";
    } else if (selectedValue === "In-Person Consultation") {
        video.style.display = "none";
        consultation.style.display = "flex";
    } else {
        video.style.display = "none";
        consultation.style.display = "none";
    }
});

// Get all elements with the class name 'load'
var loadButtons = document.getElementsByClassName('load');

// Iterate through each element and add event listener
for (var i = 0; i < loadButtons.length; i++) {
    loadButtons[i].addEventListener('click', function (event) {
        // After 7 seconds, hide the 'appointment-success-data' div
        setTimeout(function () {
            document.getElementById('appointment-success-data').style.display = 'none';
            document.getElementById('appointmentSuccess').style.display = 'block';
        }, 8000);
    });
}