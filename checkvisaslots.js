let $nav = $(".navbar-fixed-top"); $(document).scroll(function () { $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height()); });
if (window.location.href.includes("pro.html")) {validateApiKey();}
else if (window.location.href.includes("mysubscription.html")) { getSubscriptionData() }
const extensionId = "beepaenfejnphdgnkmccjcfiieihhogl";

// Collapse Navbar
$('.navbar-nav>li>a').on('click', function (e) {if (!e.currentTarget.parentNode.className.includes('dropdown')) {$('.navbar-collapse').collapse('hide')}});

/** Common Functions */
function getUTCdate() {
    let today = new Date();
    let dd = today.getDate(), mm = today.getMonth() + 1, yyyy = today.getFullYear();
    if (dd < 10) { dd = '0' + dd }
    if (mm < 10) { mm = '0' + mm }
    today = yyyy + '-' + mm + '-' + dd;
    return today
}

function convertToLocal(utc_time) {
	const local_tz_fmt = {year: 'numeric',  month: 'short',  day: 'numeric',  hour: '2-digit',  minute: '2-digit', timeZoneName: 'short'};
	let local_ts_fmt = new Date(utc_time).toLocaleString('en-US', local_tz_fmt).replace("GMT+5:30", "IST")
	if (local_ts_fmt === "Invalid Date") { local_ts_fmt = utc_time }
	return local_ts_fmt
}

function getAPIKey() {
    let api_key = localStorage.getItem("cvs_api_key");
    return api_key || null;
}
function showErrorToast(message) {
    pushToast("❌❌ Failure ❌❌", message ? message : "Something is not correct, please report to support@checkvisaslots.com")
}

function APIService(urlPath, method, data, isKeyReq = true) {
    return new Promise((resolve, reject) => {
        let api_key = getAPIKey();
        if (!api_key && isKeyReq) {
            return reject(new Error("Please give your Access Code.")); }

        $.ajax({
            url: what_is(urlPath),
            type: method,
            headers: { "x-api-key": api_key },
            data: method === "POST" ? data : null,
            success: function (data) {
				if (data.hasOwnProperty('message')) {
					pushErrorModal("Message for you", data.message)
				}
                resolve(data)
            },
            error: function (response) {
                reject(response.responseJSON ? response.responseJSON.message: response.statusText)
            },
        })
    })
}

// push an async toast
async function pushToast(toast_head, toast_body, delay = 5000) {
    $('.toast .mr-auto').text(toast_head);
    $('.toast .toast-body').html(toast_body);
    $('.toast').toast({ delay: delay });
    $('.toast').toast("show");
}

// push an async error modal
async function pushErrorModal(md_title, md_body, bring_top=false) {
    $('#errorModalTitle').html(md_title);
    $('#errorModalBody').html(md_body);
	if (bring_top) {
		document.querySelector("#errorModal").style.cssText += "z-index: 100000"
	}
    $('#errorModal').modal('show')
}

const units = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: 24 * 60 * 60 * 1000 * 365 / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
}, rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

let getRelativeTime = (d1, d2 = new Date()) => {
    let elapsed = d1 - d2;
    // "Math.abs" accounts for both "past" & "future" scenarios
    for (let u in units)
        if (Math.abs(elapsed) > units[u] || u === 'second')
            return rtf.format(Math.round(elapsed / units[u]), u)
}

$('#galleryModal').on('show.bs.modal', function (e) {
    document.getElementById("img-helper-info").style.display = "none";
    let img = $(e.relatedTarget).data("large-src"),
        // im = new Image,
        img_createdon = new Date($(e.relatedTarget).data("createdon")),
        time_diff = 999999999;
    $('#galleryImage').attr("src", img);
    $('#galleryImage').attr("data-img-id", $(e.relatedTarget).data("id"));
    document.getElementById('createdon').innerHTML = convertToLocal(img_createdon);
    document.getElementById('imgTS').innerHTML = convertToLocal(img_createdon);
    time_diff = Date.now() - Date.parse(img_createdon);

    //Display the relative time if it is under 30 minutes
    if ((time_diff) <= 35 * 60 * 1000) {
        // Hide the 'Report Incorrect Info' button if time_diff is more than 3 minutes
        if (time_diff > 3 * 60 * 1000) {
            let tmp = $('.user-feedback')[0];
            if (tmp) {tmp.hidden = true}
        }
        document.getElementById('relativeTime').innerHTML = " &nbsp; 🕑 " + getRelativeTime(img_createdon);
    } else { document.getElementById('relativeTime').innerHTML = '' }
    document.getElementById("img-helper-info").style.display = "-webkit-inline-box";
});

function what_is(action, base_url="app", url_path="") {
    const api_refs = {
        "contact": "contact",
        "retrieve": "retrieve/v1",
        "validate": "validate/v3",
        "feedback": "feedback",
        "notifications": "notifications/v3",
        "subscriptionDetails": "subscription-details/v1",
        "subscriptionUpdate": "subscription-update/v1",
        "subscriptionRank": "subscription-rank",
        "activity": "activity/v1",
	    "fetchImage": "fetch-image",
        "cacheReset": "cache-reset"
    };
    // check if the action is in the api_refs
    if (["contact", "subscriptionUpdate", "feedback", "cacheReset"].includes(action)) {
        base_url = "app-utils"
    }
    // return "http://127.0.0.1:5000/" + api_refs[action];
    return url_path ? url_path : (`https://${base_url}.checkvisaslots.com/` + api_refs[action]);
}


// For the "ContactUs" show up
$('#contactModal .send-btn').click(function (e) {
    // Validate the form
    e.preventDefault();
    let form = document.querySelector("#contactModal form");
    if (form.checkValidity() === false) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return
    }
    $.ajax({
        url: what_is("contact"),
        type: "POST",
        cache: false,
        async: false,
        data: {
            "user_email": $('#contact_email').val(),
            "message": "Access Code: " + localStorage.getItem("cvs_api_key") + "\n\n" + $('#contact_message').val(),
            "subject": $('#contact_subject').val(),
            "source_email": "support@checkvisaslots.com",
            "destination_email": "support@checkvisaslots.com"
        },
        success: function (response) {
            document.getElementById('contact_form').reset();
            $(".toast .toast-head").text("✅✅ Success ✅✅");
            $(".toast .toast-body").html(`<img src="https://media.tenor.com/images/2e2f3e23be9e292bb33311b893042c28/tenor.gif">`);
            $('.toast').toast({ delay: 5000 });
            $('.toast').toast("show");
        },
        error: function (resp) {
            pushToast("❌❌ Failure ❌❌", "Oops!! We messed this up. Could you please drop an email at support@checkvisaslots.com", 5000);
        },
        complete: function (resp) { }
    });
});

// To force the modal for valid PRO Access Code
function checkApiKey(is_invalid= false) {
    if (!localStorage.getItem("cvs_api_key") || is_invalid) {
        $('#proUIModal').modal({ show: true, backdrop: 'static', keyboard: false });
        return 0
    }
    return 1
}

// TO validate the PRO API key
function validateApiKey() {
    if (!checkApiKey()) { return }
    let api_key = localStorage.getItem("cvs_api_key");
	APIService("validate", "GET").then(function (response) {
        getUserContributions()
        if (response["visa_type"].startsWith('F-')) { document.getElementById("f1-tiles").style.display = "flex" }
        displayAPIKeyInfo(api_key, response);
        pushToast("✅✅ Success ✅✅", "Access Code Usage Details are refreshed.")
    }).catch((error) => {
        showErrorToast(error);
        pushToast("❌❌ Failure ❌❌", error)
        checkApiKey(is_invalid=true)
    })
}


function getUserContributions() {
    //check the local storage for the user contribution data
    let gmt_date = getUTCdate(), activityData = localStorage.getItem("cvs_activity");

    if (activityData) {
        if (JSON.parse(activityData)[gmt_date]) {
            activityData = JSON.parse(activityData)[gmt_date]
            return updateUserContributionData(activityData);
        }
    }

    APIService('activity', "POST").then(function (response) {
        activityData = response["activity"];
        updateUserContributionData(activityData);
        let tmp = {};
        tmp[gmt_date] = activityData;
        localStorage.setItem("cvs_activity", JSON.stringify(tmp));
    }).catch((error) => {
        showErrorToast(error);
        document.getElementById('activity').innerHTML = `<p>No data available</p>`
    })
}

function updateUserContributionData(userContributionData) {
    let contributionsMarkup = ``, usageMarkup = ``, datesMarkup = ``,
        activity_markup = `<p>No data available</p>`;
    const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
    if (userContributionData.length > 0) {
        userContributionData.forEach(function (contribution) {
            let myDate = new Date(contribution.date + "T12:00:00");
            const month = formatter.format(myDate);
            const day = myDate.getDate();
            datesMarkup += `<td><span class="dates">${month} ${day}</span></td>`;
            if (contribution.upload == 0) {
                contributionsMarkup += `<td><span class="contrib-day no-contrib">${contribution.upload}</span></td>`;
            } else {
                contributionsMarkup += `<td><span class="contrib-day">${contribution.upload}</span></td>`;
            }

            if (contribution.used == 0) {
                usageMarkup += `<td><span class="used-day no-contrib">${contribution.used}</span></td>`;
            } else {
                usageMarkup += `<td><span class="used-day">${contribution.used}</span></td>`;
            }
        });
         activity_markup = `<table class="table table-sm borderless mx-auto">
                            <tr><td class="float-right"><b style="vertical-align: -webkit-baseline-middle">Uploads</b></td>` + contributionsMarkup + `</tr>
                            <tr><td></td>` + datesMarkup + `</tr>
                            <tr><td class="float-right"><b style="vertical-align: -webkit-baseline-middle">Usage</b></td>` + usageMarkup + `</tr> </table>`
    } else {
        document.getElementById('activity').innerHTML = ``
    }
    document.getElementById('activity').innerHTML = activity_markup;
}

// To retrieve transactions associated to the API key
function getTransactions() {
    let api_key = localStorage.getItem("cvs_api_key");

    if (localStorage.getItem("cvs_txn_latest") === null) { }
    else {
        const delayTime = 60;     // in seconds
        let waitTime = delayTime - parseInt((Date.now() - parseInt(localStorage.getItem("cvs_txn_latest"))) / 1000);

        if (waitTime <= 0) { $("#wait-refresh").html(""); }
        else {
            pushToast("⌛ Hold those horses!!", `${delayTime} seconds wait time is recommended between successive refreshes, more ${waitTime} seconds left`)
            $("#wait-refresh").html(`&nbsp; .. wait for ${waitTime} seconds`);
            return
        }
    }
    $("#last-refreshed").html(`Latest slots retrieved at: ${new Date().toLocaleString()}`);


	APIService("retrieve", "GET").then(function (response) {
		let images_body = "";
        localStorage.setItem("cvs_txn_latest", Date.now().toString())
        for (let element of response) {
            let src_;
            // src_ = "https://cvs-all-files.s3.amazonaws.com" + element['img_url'];
            src_ = element['img_url'];
            images_body += `<div class="col-lg-3 col-md-4 col-sm-4 py-2">
            <a href="#galleryModal" data-large-src="${src_}" data-createdon="${element["createdon"]}" data-id="${element["img_id"]}" data-toggle="modal">
            <img src="${src_}" class="img-fluid img-thumbnail img-panels" title="${element["createdon"]}">
            </a></div>`;
        }
        document.getElementById("display_images").innerHTML = images_body;
        pushToast(toast_head = "✅✅ Success ✅✅", toast_body = "Latest Slots Availability Retrieved.")
	}).catch((error) => {
		showErrorToast(error);
		pushToast("❌❌ Failure ❌❌", error)
        if (error.indexOf('daily limit') > -1) {
            pushErrorModal(error, `You get only 20 free sessions for 24 hours to check the screenshots shared by others. This is a community platform. Every user is responsible for sharing the visa slots availability. <br><br><b>Follow the instructions below.</b><br><ol><li>Give your Access Code <a href='chrome-extension://${extensionId}/popup.html' rel='noreferrer' target='_blank'>here</a></li><li>Login to your <a href='https://www.usvisascheduling.com/en-US/' rel='noreferrer' target='blank'>CGI portal</a> and check the slots</li><li>Comeback Here and refresh</li></ol>`)
        }
        else if (error.indexOf('Install the Chrome extension') > -1) {
            pushErrorModal(error, `You get only 20 free sessions for 24 hours to check the screenshots shared by others. This a community platform. Sharing is Caring, made easy with the Chrome extension & website. <br><br><b>Follow the instructions below.</b> <br><ol><li>Install our <a href='https://chrome.google.com/webstore/detail/check-us-visa-slots/${extensionId}' rel='noreferrer' target='_blank'>Chrome Extension</a><li>Give your Access Code <a href='chrome-extension://${extensionId}/popup.html' rel='noreferrer' target='_blank'>here</a></li><li>Login to your <a href='https://www.usvisascheduling.com/en-US/' rel='noreferrer' target='blank'>CGI portal</a> and check the slots</li><li>Comeback Here and refresh</li></ol>`)
        } else { pushToast("❌❌ Failure ❌❌", error) }
	})
}

function displayAPIKeyInfo(api_key, cvs_val_resp) {
    $('.usage_info').empty();
    $('.api_key_info').empty();
    localStorage.setItem("cvs_user_info", JSON.stringify(cvs_val_resp))
    let contributions, img_sess, ext_sess, used, remaining, subscription, activity = cvs_val_resp["userActivity"];
    contributions = activity.hasOwnProperty('upload') ? activity['upload'] : 0
    img_sess = activity.hasOwnProperty('retrieve') ? activity['retrieve'] : 0
    ext_sess = activity.hasOwnProperty('slots') ? activity['slots'] : 0
    subscription = cvs_val_resp["subscription"] === 'FREE' ? `<a href="index.html#pricing" <button type="button" class="btn btn-success rounded-pill">Subscribe</button></a>` :
        `<a href="mysubscription.html"> <button type="button" class="btn btn-info rounded-pill p-1">My Subscription</button></a>`
    used = img_sess + ext_sess;
    remaining = (contributions + 1) * 20 - used;
    remaining = remaining >= 0 ? remaining : 0;
    const chrome_rating_btn = document.getElementById("chrome-rating");
    if (chrome_rating_btn) {
        if (remaining > 0) { document.getElementById("chrome-rating").style.display = "unset"; }
        else { document.getElementById("chrome-rating").style.display = "none"; }
    }
    let table_api_key_info = `<td>${cvs_val_resp["apikey"]}</td><td>${cvs_val_resp["visa_type"]}</td><td>${cvs_val_resp["appointment_type"]}</td><td class="p-1">${subscription}</td>`,
        table_sessions_info =`<td>${contributions}</td><td>${img_sess}</td><td>${ext_sess}</td><td>${remaining}</td>`;
    document.getElementById('api_key_info').innerHTML = table_api_key_info;
    document.getElementById('sessions_info').innerHTML = table_sessions_info;
    document.getElementById("user_visa_type").innerHTML = `<b>${cvs_val_resp["visa_type"]} (${cvs_val_resp["appointment_type"]})</b>`;
    pushToast("✅✅ Refresh successful ✅✅", "Access Code Details refreshed!!");
    return cvs_val_resp["keyType"]
}

// validate API key
$('#proUIModal .send-btn').click(function (e) {
    e.preventDefault();
    let form = document.querySelector("#proUIModal form"), validate_endpoint = 'validate';
    if (window.location.pathname.includes('mysubscription')) { validate_endpoint = 'subscriptionDetails' }

    if (form.checkValidity() === false) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return
    }
    let toast_body, toast_head, api_key = document.getElementById("api_key").value.trim();
    $.ajax({
        url: what_is(validate_endpoint),
        type: "GET",
        headers: { "x-api-key": api_key },
        success: function (response) {
            localStorage.setItem("cvs_api_key", api_key);
            location.reload();
            toast_head = "🙏 Welcome !!";
            toast_body = "Do not hesistate to contact for troubleshooting issues";
        },
        error: function (response) {
            toast_head = "❌❌ Failure ❌❌";
            toast_body = response.responseJSON ? response.responseJSON.message: response.statusText;
            checkApiKey(is_invalid=true)
        },
        complete: function (response) {
            pushToast(toast_head, toast_body)
        }
    });
});

async function imgFeedback(data) {
    let api_key = localStorage.getItem("cvs_api_key");
    if (!api_key) { return }
    $.ajax({
        url: what_is("feedback"),
        type: "POST",
        headers: { "x-api-key": api_key },
        data: data,
        success: function (response) {
            pushToast("✅✅ Success ✅✅", "Thanks for sharing the feedback")
        },
        error: function (response) {
            pushToast("❌❌ Failure ❌❌", response.responseJSON ? response.responseJSON.message: response.statusText)
        },
        complete: function (response) {
            // console.log("complete-->", response);
        }
    })
}

$('.user-feedback').click(function (e) {
    let img_id = e.currentTarget.parentElement.parentElement.querySelector('img').dataset.imgId,
        feed = e.currentTarget.dataset.value, prompt_msg;
    let user_data = { 'feed': feed, 'img_id': img_id, 'page': window.location.pathname }, cnfrm_prompt_msg;
    if (feed === 'slap') {
        prompt_msg = `We will make sure to penalize this bad image contributor.`
        cnfrm_prompt_msg = `<p>${prompt_msg}<u> If you are incorrect</u>, your sessions will be reduced. Are you sure this image is incorrect?</p><div class="row">
            <div class="col-6 text-center"><button class="btn btn-outline-warning fdbk-cnfm" data-dismiss="modal">Yes</button></div>
            <div class="col-6 text-center"><button type="button" class="btn btn-outline-success" data-dismiss="modal">No</button></div>
        </div>`;
        pushErrorModal('Report Incorrect Image', cnfrm_prompt_msg)

        $('.fdbk-cnfm').click(function () {
            pushToast("✅✅ Success ✅✅", prompt_msg)
            imgFeedback(user_data)
        })
    } else if (feed === 'clap') {
        prompt_msg = "We will make sure to convey your appreciation to the image contributor."
        pushToast("✅✅ Success ✅✅", prompt_msg)
        imgFeedback(user_data)
    }
});


$("#reg_form").on('submit', function (e) {
    e.preventDefault()
    e.stopPropagation()
    let start_date = document.getElementById("start_date").value,
        email_id = document.getElementById("email_id").value,
        visa_type = document.getElementById("visa_type").value,
        appointment_type = document.getElementById("appointment_type").value;

    if (start_date && email_id && visa_type && appointment_type) {
        document.querySelectorAll('#reg_form input, #reg_form select, #reg_form button').forEach(elem => elem.disabled = true);
        showPayment([email_id, start_date, visa_type, appointment_type].join('|'))
    }
})

/** Get Subscription Data */
function getWithZero(monthNumber) {
    return monthNumber.toString().length === 1 ? `0${monthNumber}` : monthNumber;
}
function formattedDate(dateString) {
    var dateObj = new Date(dateString)
    return dateObj.getFullYear() + "-" + getWithZero(dateObj.getMonth() + 1) + "-" + getWithZero(dateObj.getDate())
}

async function getSubscriptionData() {
    APIService('subscriptionDetails', "GET").then(function (response) {
		displaySubRankings(response)
	    getSubNotifications();

		let subscription_data = response;
        localStorage.setItem("subscription_data", JSON.stringify(subscription_data));
	    setLocPreferences(subscription_data)
	    $('#sub_email').val(subscription_data["email"]);
        $('#sub_alert_email').val(subscription_data["alert_email"]);
        $('#preferred_slot_start_date').val(formattedDate(subscription_data["preferred_slot_start_date"]));
        $('#preferred_slot_end_date').val(formattedDate(subscription_data["preferred_slot_end_date"]));
        $('#sub_visa_type').val(subscription_data["visa_type"]);
        $('#sub_appointment_type').val(subscription_data["appointment_type"]);
        $('#sub_end_date').val(formattedDate(subscription_data["subscription_end_ts"]));
        $('#sub_start_date').val(formattedDate(subscription_data["subscription_start_ts"]));
        let subs_pref = JSON.parse(subscription_data["preferences"])
        $('#zero_rank_alarm').val(subs_pref["zero_rank_alarm"] || 1)
        $('#min_slots_count').val(subs_pref["min_slots_count"] || 0)
        $('#alerts_type').val(subs_pref["alerts_type"] || "email")

        if (subscription_data.allow_changes) {
            document.getElementById("sub_email").removeAttribute("readonly");
            document.getElementById("sub_alert_email").removeAttribute("readonly");
            pushToast("Subscription Details", "You are NOT contributing from " + $('#sub_email').val() + ". You are allowed to change the CGI Email ID and Alert Email ID ONLY ONCE. Update it with correct information.")
        }
    }).catch((error) => {
        showErrorToast(error)
        $('#proUIModal').modal({ show: true, backdrop: 'static', keyboard: false });
    })
}

async function setLocPreferences(subscription_data) {
	const preferences = JSON.parse(subscription_data["preferences"]);

	preferences['preferred_ofc_locations'] = preferences.hasOwnProperty('preferred_ofc_locations') ? JSON.parse(preferences['preferred_ofc_locations']) : [];
    preferences['preferred_ca_locations'] = preferences.hasOwnProperty('preferred_ca_locations') ? JSON.parse(preferences['preferred_ca_locations']) : [];

	if (!preferences['preferred_ofc_locations'].length) {$('#ofc_locations.selectpicker').selectpicker('selectAll');}
	else {$('#ofc_locations.selectpicker').selectpicker('val', preferences['preferred_ofc_locations']);}

	if (subscription_data["appointment_type"] === "Dropbox") {
		$('#ca_locations').prop('disabled', true);
		$('#ca_locations').selectpicker('refresh');

		$('button[data-id="ca_locations"] .filter-option-inner-inner')[0].outerText = "Dropbox Appointments don't require CA Locations";
	}
	else if (!preferences['preferred_ca_locations'].length) {$('#ca_locations.selectpicker').selectpicker('selectAll');}
	else {$('#ca_locations.selectpicker').selectpicker('val', preferences['preferred_ca_locations']);}
}

function changePreferredDate(e) {
    let startDate = e.target.value;
    let endDate = new Date(startDate)
    endDate = new Date(endDate.setMonth(endDate.getMonth() + 6));
    if (startDate) {
        $('#preferred_slot_end_date').val(formattedDate(endDate))
    }
}

function getSelectedLocations(id) {
    let selected = [];
    $('#' + id).find("option:selected").each(function () {
        selected.push($(this).val().toUpperCase());
    });
    return selected
}

function updateSubscriptionData() {
	let preferred_window_days = (new Date($('#preferred_slot_end_date').val()) - new Date( $('#preferred_slot_start_date').val()))/86400000
	if (preferred_window_days < 1) {
		pushErrorModal("Incorrect Dates", "Preferred End Date must be later than Preferred Start Date.")
		return 0
	} else if (preferred_window_days > 6*32) {
		pushErrorModal("Incorrect Dates", "Your Preferred window can not be more than 6 months.")
		return 0
	}

    let data = {
        "preferred_slot_start_date": $('#preferred_slot_start_date').val(),
        "preferred_slot_end_date": $('#preferred_slot_end_date').val(),
	    "zero_rank_alarm": parseInt($('#zero_rank_alarm').val()),
	    "preferred_ofc_locations": JSON.stringify(getSelectedLocations("ofc_locations")),
	    "preferred_ca_locations": JSON.stringify(getSelectedLocations("ca_locations")),
        "alerts_type": $('#alerts_type').val(),
        "min_slots_count": $('#min_slots_count').val(),
        "cgi_email_id": $('#sub_email').val(),
        "alert_email": $('#sub_alert_email').val()
    },
	    prev_sub_data = JSON.parse(localStorage.getItem("subscription_data"));

	prev_sub_data["preferences"] = JSON.parse(prev_sub_data["preferences"]);
	if (data["preferred_ofc_locations"].length === 0) {
		pushErrorModal("OFC Location Selection Error", "Select at least one preferred OFC(Biometrics/Dropbox) location.")
		return 0
	}
	else if (data["preferred_ca_locations"].length === 0 && prev_sub_data["appointment_type"] !== "Dropbox") {
		pushErrorModal("CA Location Selection Error", "Select at least one preferred CA(Visa Interview) location.")
		return 0
	}

	if (prev_sub_data) {
		if (formattedDate(prev_sub_data["preferred_slot_start_date"]) === data["preferred_slot_start_date"] &&
			formattedDate(prev_sub_data["preferred_slot_end_date"]) === data["preferred_slot_end_date"] &&
			parseInt(prev_sub_data["preferences"]["zero_rank_alarm"]) === parseInt(data["zero_rank_alarm"]) &&
			prev_sub_data["preferences"]["preferred_ofc_locations"] ===  data["preferred_ofc_locations"] &&
			prev_sub_data["preferences"]["preferred_ca_locations"] ===  data["preferred_ca_locations"] &&
            prev_sub_data["alerts_type"] === data["alerts_type"] &&
            parseInt(prev_sub_data["min_slots_count"]) === parseInt(data["min_slots_count"])
        ) {
			return pushToast("No Changes", "You have not made any changes to your subscription details.")
		}
	}

    APIService('subscriptionUpdate', "POST", data).then(function (response) {
        pushToast("✅✅ Success ✅✅", "Subscription details updated successfully.");
        setTimeout(function () {window.location.reload();}, 2500);
    }).catch((error) => {
        showErrorToast(error)
    });

}

/* Get Subscription Notifications Sent to Users */
async function getSubNotifications() {

    APIService('notifications', "GET").then(function (response) {
        let notifications_history = response.result,
	        table_notifications_history = '',
	        counter = 1;
        notifications_history.forEach(notification => {
            let details = JSON.parse(notification.details);
            let is_received_col = "";
            if (notification?.is_received) {
                is_received_col = `<span class='text-success'>${notification?.sent_to.toUpperCase()}</span>`
            } else {
                is_received_col = "No"
            }
            table_notifications_history += `<tr>
                        <td>${counter++}</td>
                        <td class="text-left">${convertToLocal(notification?.createdon)}</td>
                        <td class="text-left">${details?.visa_location}</td>
                        <td>${notification?.available_dates}</td>
                        <td>${notification?.recipients_n}</td>
                        <td>${is_received_col} </td>
                        <td>${notification?.reason}</td>
                        <td><button onclick="viewNotificationModal(this)"  data-toggle="modal" data-target="#notificationModal" data-details="${details?.table_data}" class="btn btn-link">View</button></td>
                    </tr>`
        })
        $('.notifications_table tbody').empty();
        $('.notifications_table tbody').append(table_notifications_history);
    }).catch((error) => {
        showErrorToast(error)
	    pushErrorModal("Message", error)
        $('.notifications_table tbody').append(`<tr><td  class='text-danger' colspan='8'>${error}</td></tr>`);
    })

}
// Get Subscription Users Rankings Based on their contributions
async function displaySubRankings(response) {
	if (response) {
        let rankings_data = response;
        let table_rankings_data = `<tr>
                        <td>${rankings_data.Rank}</td>
                        <td>${rankings_data.Count}</td>
                        <td>${convertToLocal(rankings_data?.LastContributedAt)}</td>
                    </tr>`
        $('.rankings_table tbody').empty();
        $('.rankings_table tbody').append(table_rankings_data);
    } else {
		// showErrorToast(error)
		$('.rankings_table tbody').append(`<tr><td class='text-danger' colspan='2'>${'error'}</td></tr>`);
    }

	if (response.hasOwnProperty('message')) {
		pushErrorModal("Incorrect CGI Email ID", response.message)
	}
}

function viewNotificationModal(element) {
    let details = element.dataset.details;
    $('#notification_body').empty();
    $('#notification_body').append(details);
}

/** Show Error Toast When the Email Alerts are not available */
async function checkAlertsEligibility() {
	let visa_type = document.getElementById('visa_type').value, apnt_type = document.getElementById('appointment_type').value, v_a = apnt_type ? `${visa_type} (${apnt_type})`: visa_type;
    if (['other', 'B1'].includes(visa_type) || (visa_type === 'H-4' && apnt_type === 'Dropbox')){
        showErrorToast(`There is less user activity from <b>${v_a}</b> visa users. Hence we held email alerts.`);
        document.getElementById('payment-submit').disabled = true
    } else {
		document.getElementById('payment-submit').disabled = false;
	}
}
