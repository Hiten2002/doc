// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAS-Nw8goYPAZ1AmbTZQIh5wLdpM-m0ZWY",   
    authDomain: "docube-website.firebaseapp.com",   
    projectId: "docube-website",   
    storageBucket: "docube-website.appspot.com",   
    messagingSenderId: "200646445092",   
    appId: "1:200646445092:web:2597df3a3d62cf4e8ef0b1",   
    measurementId: "G-THT2SVEG71"
};
 
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
    const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlaWQiOjI1NzExLCJ1aWQiOjQ5NDg5OCwiYXVkIjpbImNjX2FwaSJdLCJjdWlkIjpudWxsLCJldWlkIjoiYjRhNWQ3MjEtN2UzYS00MDQ4LThhODYtZTFmMjkyYmU4YzVmIiwib3VpZCI6IjI5ODE0MWFhLTE0ZjgtNDViYi05YjdkLTM5NTczMzJjOGZiNCIsInVzZXJfbmFtZSI6IiR1c2VySWQ6NDk0ODk4I3R5cGU6RU1QTE9ZRUUiLCJzY29wZSI6WyJFTVBMT1lFRSJdLCJ1dWlkIjoiNzVmNDJlYjItNTc5ZC00NGNmLWJiOTUtZjBiNWZkOTk5NjJhIiwianRpIjoiYTdiYWZjNzMtMWEyZC00MzJmLTllMDQtM2JmZmE3ZDU2YWM5IiwiY2xpZW50X2lkIjoicHJvdmlkZXJfd2ViIiwiY2lkIjpudWxsfQ.phlFjN6PW4hNeLDVZPdbVOGkYx8rOZcr0pNK5eip830';
 
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