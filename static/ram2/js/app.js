const debug = false;
const drive = "b!ke3cURxhuEOowDZ8Isx-b0DoOZc1X_lKjcVghFA_3dDELeTyyf9jSKXnDV2F4sCZ";
const workbook = "01GGBEMY5JVT2ZGVLZKZFL3ACT6VIZEL5B";

const ageLimitInDays = 120;
const mileageLimit = 4000;

// Graph API endpoint
let graphApiEndpoint = "https://graph.microsoft.com/v1.0/drives/" + drive + "/items/" + workbook + "/workbook/worksheets/bookings/UsedRange";
// Graph API scope used to obtain the access token to read user profile
let graphAPIScopes = ["https://graph.microsoft.com/Files.Read.All"];


// Initialize application
let userAgentApplication = new Msal.UserAgentApplication(msalconfig.clientID, null, loginCallback, {
    redirectUri: msalconfig.redirectUri
});

//Previous version of msal uses redirect url via a property
if (userAgentApplication.redirectUri) {
    userAgentApplication.redirectUri = msalconfig.redirectUri;
}

window.onload = function() {
    // If page is refreshed, continue to display user info
    if (!userAgentApplication.isCallback(window.location.hash) && window.parent === window && !window.opener) {
        var user = userAgentApplication.getUser();
        if (user) {
            callGraphApi();
        }
    }
}

/**
 * Call the Microsoft Graph API and display the results on the page. Sign the user in if necessary
 */
function callGraphApi() {
    // alert("@callGraphApi()");
    var user = userAgentApplication.getUser();
    // alert(user);
    if (!user) {
        // If user is not signed in, then prompt user to sign in via loginRedirect.
        // This will redirect user to the Azure Active Directory v2 Endpoint
        userAgentApplication.loginRedirect(graphAPIScopes);
        // The call to loginRedirect above frontloads the consent to query Graph API during the sign-in.
        // If you want to use dynamic consent, just remove the graphAPIScopes from loginRedirect call.
        // As such, user will be prompted to give consent when requested access to a resource that
        // he/she hasn't consented before. In the case of this application -
        // the first time the Graph API call to obtain user's profile is executed.
    } else {
        // If user is already signed in, display the user info
        var userInfoElement = document.getElementById("userInfo");
        // userInfoElement.parentElement.classList.remove("hidden");
        userInfoElement.innerHTML = JSON.stringify(user, null, 4);

        // Show Sign-Out button
        document.getElementById("signOutButton").classList.remove("hidden");

        // Now Call Graph API to show the user profile information:
        var graphCallResponseElement = document.getElementById("graphResponse");
        // graphCallResponseElement.parentElement.classList.remove("hidden");
        graphCallResponseElement.innerText = "Calling Graph ...";

        // In order to call the Graph API, an access token needs to be acquired.
        // Try to acquire the token used to query Graph API silently first:
        userAgentApplication.acquireTokenSilent(graphAPIScopes)
            .then(function(token) {
                //After the access token is acquired, call the Web API, sending the acquired token
                callWebApiWithToken(graphApiEndpoint, token, graphCallResponseElement, document.getElementById("accessToken"));

            }, function(error) {
                // If the acquireTokenSilent() method fails, then acquire the token interactively via acquireTokenRedirect().
                // In this case, the browser will redirect user back to the Azure Active Directory v2 Endpoint so the user
                // can reenter the current username/ password and/ or give consent to new permissions your application is requesting.
                // After authentication/ authorization completes, this page will be reloaded again and callGraphApi() will be executed on page load.
                // Then, acquireTokenSilent will then get the token silently, the Graph API call results will be made and results will be displayed in the page.
                if (error) {
                    userAgentApplication.acquireTokenRedirect(graphAPIScopes);
                }
            });

    }
}

/**
 * Callback method from sign-in: if no errors, call callGraphApi() to show results.
 * @param {string} errorDesc - If error occur, the error message
 * @param {object} token - The token received from login
 * @param {object} error - The error string
 * @param {string} tokenType - the token type: usually id_token
 */
function loginCallback(errorDesc, token, error, tokenType) {
    if (errorDesc) {
        // alert(error);
        showError(msal.authority, error, errorDesc);
    } else {
        callGraphApi();
    }
}

/**
 * Show an error message in the page
 * @param {string} endpoint - the endpoint used for the error message
 * @param {string} error - Error string
 * @param {string} errorDesc - Error description
 */
function showError(endpoint, error, errorDesc) {
    var formattedError = JSON.stringify(error, null, 4);
    if (formattedError.length < 3) {
        formattedError = error;
    }
    document.getElementById("errorMessage").innerHTML = "An error has occurred:<br/>Endpoint: " + endpoint + "<br/>Error: " + formattedError + "<br/>" + errorDesc;
    console.error(error);
}

/**
 * Call a Web API using an access token.
 * @param {any} endpoint - Web API endpoint
 * @param {any} token - Access token
 * @param {object} responseElement - HTML element used to display the results
 * @param {object} showTokenElement = HTML element used to display the RAW access token
 */
function callWebApiWithToken(endpoint, token, responseElement, showTokenElement) {
    // alert("@callWebApiWithToken()");
    var headers = new Headers();
    var bearer = "Bearer " + token;
    headers.append("Authorization", bearer);
    var options = {
        method: "GET",
        headers: headers
    };

    fetch(endpoint, options)
        .then(function(response) {
            var contentType = response.headers.get("content-type");
            if (response.status === 200 && contentType && contentType.indexOf("application/json") !== -1) {
                response.json()
                    .then(function(data) {

                        // console.log(data);

                        // Display response in the page
                        // responseElement.innerHTML = JSON.stringify(data, null, 4);
                        // if (showTokenElement) {
                        //     showTokenElement.parentElement.classList.remove("hidden");
                        //     showTokenElement.innerHTML = token;
                        // }

                        let fa = "https://graph.microsoft.com/v1.0/drives/" + drive + "/items/" + workbook + "/workbook/worksheets/Fleet Allocation/UsedRange";
                        fetch(fa, options)
                            .then(function(r) {
                                let ct = response.headers.get("content-type");
                                if (r.status === 200 && ct && ct.indexOf("application/json") !== -1) {
                                    r.json()
                                        .then(function(d) {
                                            let s = {};
                                            s.bookings = data;
                                            s.fleetallocation = d;

                                            if (debug) {
                                                console.log("");
                                                console.log("aggregated sheets:");
                                                console.log("------------------");
                                                console.dir(s);
                                            }

                                            return (s);

                                        })
                                        .then(function(data) {

                                            let b = {};
                                            b.headings = data.bookings.values[0];
                                            b.columns = ["Name",
                                                "Surname",
                                                "Machine",
                                                // "Date Confirmed",
                                                "Reg No",
                                                // "MID",
                                                "Panniers",
                                                "Top-Box",
                                                "Tank-Bag",
                                                "Start date",
                                                "Collect",
                                                "Return date",
                                                "Return",
                                                // "days",
                                                "Booking",
                                                "rental",
                                                "Ins (non-UK)",
                                                "GPS",
                                                "Extra Charges",
                                                // "Balance Due",
                                                // "Card on file",
                                                // "Rider Name",
                                                // "Email Address",
                                                // "Street",
                                                // "Town",
                                                // "County",
                                                // "Postcode",
                                                "Country",
                                                // "Tel 1",
                                                // "Mobile",
                                                // "Dr Lic",
                                                // "d.o.b.",
                                                // "Source",
                                                // "Notes",
                                                "Rider Name",
                                                // "Start date",
                                                // "Return date",
                                                "days",
                                                // "Machine",
                                                // "Reg No",
                                                // "rental",
                                                "Start Mileage",
                                                "Finish Mileage",
                                                // "Total Miles",
                                                // "Average Miles/day",
                                                // "Damage Invoiced",
                                                // "Thank you email date",
                                                // "Comments"
                                            ];


                                            // Bookings
                                            // --------

                                            b.rows = [];

                                            for (let i = 1; i < data.bookings.rowCount; i++) {
                                                let t = data.bookings.text[i] || null;
                                                let v = data.bookings.values[i] || null;

                                                if (t[[0]] != "") {
                                                    // console.log("row " + i);
                                                    // console.log(r);
                                                    let o = {};

                                                    $.each(b.columns, function(j, f) {

                                                        let nf = f.toLowerCase().replace(/[ |\-()]/ig, "");

                                                        o[nf] = {};
                                                        o[nf].v = v[b.headings.indexOf(f)];

                                                        switch (nf) {
                                                            case "regno":
                                                                o[nf].t = trimReg(t[b.headings.indexOf(f)])
                                                                break;

                                                            default:
                                                                o[nf].t = t[b.headings.indexOf(f)];
                                                        }
                                                    });

                                                    b.rows.push(o);
                                                }
                                            }

                                            if (debug) {
                                                console.log("");
                                                console.log("bookings:");
                                                console.log("---------");
                                                console.dir(b.rows);
                                            }



                                            // Fetch Bike Registrations (Fleet Allocation)
                                            // -------------------------------------------

                                            let f = {};
                                            f.reg = [];
                                            f.bikes = {};

                                            $.each(data.fleetallocation.text[9], function(r) {
                                                // console.log("r");
                                                // console.log(r);
                                                let bike = data.fleetallocation.text[6][r];
                                                let tbox = data.fleetallocation.text[7][r];
                                                let pannier = data.fleetallocation.text[8][r];
                                                let tbag = data.fleetallocation.text[9][r];
                                                let gps = data.fleetallocation.text[10][r];
                                                let bars = data.fleetallocation.text[11][r];
                                                let reg = trimReg(data.fleetallocation.text[12][r]);
                                                let treg = trimReg(reg);
                                                let dofr = data.fleetallocation.text[13][r];
                                                let on = data.fleetallocation.text[14][r];
                                                let off = data.fleetallocation.text[15][r];
                                                let lmiles = data.fleetallocation.text[16][r];
                                                let sdmil = data.fleetallocation.text[17][r];
                                                let sddate = data.fleetallocation.text[18][r];
		                            
                                                if (reg != "") {
                                                    f.reg.push(treg);
                                                    f.bikes[treg] = {};
                                                    f.bikes[treg].bike = $.trim(bike);
                                                    // f.bikes[treg].note = $.trim(note);
                                                    f.bikes[treg].gps = $.trim(gps);
                                                    f.bikes[treg].on = trimDate(on);
                                                    f.bikes[treg].off = trimDate(off);
                                                    f.bikes[treg].dofr = trimDate(dofr);
                                                    f.bikes[treg].lmiles = $.trim(lmiles);
                                                    f.bikes[treg].sdmil = $.trim(sdmil);
                                                    f.bikes[treg].sddate = trimDate(sddate);

                                                    f.bikes[treg].daysold = moment().startOf('day').diff(f.bikes[treg].dofr.e, 'days');

                                                    // console.dir(f.bikes[treg]);

                                                }


                                                $.each(b.rows, function(r, i) {
                                                	console.log("processing: " + treg);
                                                    if (i.regno.t == treg && treg != "") {

                                                        let n = {};
                                                        n.row = r;
                                                        n.start = i.startmileage.v;
                                                        n.end = i.finishmileage.v;
                                                        n.total = n.end - n.start;
                                                        n.from = i.startdate.t;
                                                        n.to = i.returndate.t;
                                                        n.days = i.days.v;
                                                        // n.days = moment(trimDate(i.returndate.t).e).diff(moment(trimDate(i.startdate.t).e), 'days') + 1;

                                                        let p = {};
                                                        p.rental = parseInt(i.rental.v, 10);
                                                        p.ins = parseInt(i.insnonuk.v, 10);
                                                        p.extras = parseInt(i.extracharges.v, 10);


                                                        f.bikes[treg].mileage = f.bikes[treg].mileage || {};
                                                        f.bikes[treg].revenue = f.bikes[treg].revenue || {};
                                                        f.bikes[treg].days = f.bikes[treg].days || {};

                                                        f.bikes[treg].mileage.cumulative = f.bikes[treg].mileage.cumulative || 0;
                                                        f.bikes[treg].mileage.cumulative = f.bikes[treg].mileage.cumulative + n.total;

                                                        f.bikes[treg].revenue.cumulative = f.bikes[treg].revenue.cumulative || 0;
                                                        f.bikes[treg].revenue.cumulative = f.bikes[treg].revenue.cumulative + p.rental;

                                                        f.bikes[treg].revenue.ins = f.bikes[treg].revenue.ins || 0;
                                                        f.bikes[treg].revenue.ins = f.bikes[treg].revenue.ins + p.ins;

                                                        f.bikes[treg].revenue.extras = f.bikes[treg].revenue.extras || 0;
                                                        f.bikes[treg].revenue.extras = f.bikes[treg].revenue.extras + p.extras;


                                                        for (let m = 1; m < 13; m++) {
                                                            if (trimDate(i.returndate.t).m == m) {
                                                                f.bikes[treg].days[m] = f.bikes[treg].days[m] || 0;
                                                                f.bikes[treg].days[m] = f.bikes[treg].days[m] + n.days;

                                                                f.bikes[treg].mileage[m] = f.bikes[treg].mileage[m] || {};
                                                                f.bikes[treg].mileage[m].hire = f.bikes[treg].mileage[m].hire || [];
                                                                f.bikes[treg].mileage[m].hire.push(n);

                                                                f.bikes[treg].mileage[m].start = f.bikes[treg].mileage[m].start || "";
                                                                if (n.start < f.bikes[treg].mileage[m].start || f.bikes[treg].mileage[m].start == "") { f.bikes[treg].mileage[m].start = n.start; }

                                                                f.bikes[treg].mileage[m].end = f.bikes[treg].mileage[m].end || "";
                                                                if (n.end > f.bikes[treg].mileage[m].end || f.bikes[treg].mileage[m].end == "") { f.bikes[treg].mileage[m].end = n.end; }


                                                                f.bikes[treg].mileage[m].cumulative = f.bikes[treg].mileage[m].cumulative || 0;
                                                                f.bikes[treg].mileage[m].cumulative = f.bikes[treg].mileage[m].cumulative + n.total;

                                                                f.bikes[treg].revenue[m] = f.bikes[treg].revenue[m] || {};
                                                                f.bikes[treg].revenue[m].hire = f.bikes[treg].revenue[m].hire || [];
                                                                f.bikes[treg].revenue[m].hire.push(p);

                                                                f.bikes[treg].revenue[m].revenue = f.bikes[treg].revenue[m].revenue || 0;
                                                                f.bikes[treg].revenue[m].revenue = f.bikes[treg].revenue[m].revenue + p.rental;

                                                                f.bikes[treg].revenue[m].cumulative = f.bikes[treg].revenue[m].cumulative || 0;
                                                                f.bikes[treg].revenue[m].cumulative = f.bikes[treg].revenue[m].cumulative + p.rental;
                                                                f.bikes[treg].revenue[m].ins = f.bikes[treg].revenue[m].ins || 0;
                                                                f.bikes[treg].revenue[m].ins = f.bikes[treg].revenue[m].ins + p.ins;
                                                                f.bikes[treg].revenue[m].extras = f.bikes[treg].revenue[m].extras || 0;
                                                                f.bikes[treg].revenue[m].extras = f.bikes[treg].revenue[m].extras + p.extras;

                                                            }
                                                        }

                                                    }
                                                })
                                            })

                                            if (debug) {
                                                console.log("");
                                                console.log("Fleet:");
                                                console.log("------");
                                                console.dir(f);
                                            }


                                            // Set up key dates
                                            // ----------------
                                            const today = moment().startOf('day');
                                            const startOfYear = moment().startOf('year');
                                            const endOfYear = moment().endOf('year');

                                            let minStartDate = endOfYear.valueOf();
                                            let maxStartDate = startOfYear.valueOf();
                                            let maxEndDate = startOfYear.valueOf();


                                            let hires = {}
                                            $.each(b.rows, function(r) {

                                                let row = b.rows[r];
                                                let reg = null;
                                                if (row.regno && row.regno.t) {
                                                    reg = trimReg(row.regno.t);
                                                }

                                                let o = {}
                                                o[r] = reg;

                                                let s = trimDate(row.startdate.t);
                                                let e = trimDate(row.returndate.t);

                                                // check for first and last dates
                                                minStartDate = s.e < minStartDate ? s.e : minStartDate;
                                                maxStartDate = s.e > maxStartDate ? s.e : maxStartDate;
                                                maxEndDate = e.e > maxEndDate ? e.e : maxEndDate;

                                                hires[s.e] = hires[s.e] || {};
                                                // hires[s].date = new Date(s);
                                                hires[s.e].start = hires[s.e].start || {};
                                                hires[s.e].start[r] = reg;

                                                hires[e.e] = hires[e.e] || {};
                                                // hires[e].date = new Date(e);
                                                hires[e.e].end = hires[e.e].end || {};
                                                hires[e.e].end[r] = reg;


                                                // days in between
                                                // ----------------
                                                for (let i = s.e + 86400000; i < e.e; i = i + 86400000) {
                                                    hires[i] = hires[i] || {};
                                                    hires[i].out = hires[i].out || {};
                                                    hires[i].out[r] = reg;
                                                }

                                            })

                                            if (debug) {
                                                console.log("");
                                                console.log("hires:");
                                                console.log("------");
                                                console.log(hires);
                                            }


                                            // console.log(minStartDate + " " + new Date(minStartDate));
                                            // console.log(maxStartDate + " " + new Date(maxStartDate));
                                            // console.log(maxEndDate + " " + new Date(maxEndDate));


                                            // for each day in range
                                            // ---------------------
                                            let dayRange = [];

                                            for (let day = moment(minStartDate); day <= moment(maxEndDate); day.add(1, 'day')) {
                                                let o = {};
                                                o.day = day.startOf('day').valueOf();

                                                if (hires[o.day]) {
                                                    if (hires[o.day].start) {
                                                        let s = hires[o.day].start;
                                                        $.each(s, function(d, i) {
                                                            o.starts = o.starts || {};
                                                            o.starts.rows = {};
                                                            o.starts.rows[d] = b.rows[d];
                                                            o.starts.regs = o.starts.regs || {};
                                                            o.starts.regs[i] = d;
                                                        });
                                                    }
                                                    if (hires[o.day].out) {
                                                        let t = hires[o.day].out;
                                                        $.each(t, function(d, i) {
                                                            o.outs = o.outs || {};
                                                            o.outs[d] = b.rows[d];
                                                            o.outs.regs = o.outs.regs || {};
                                                            o.outs.regs[i] = d;
                                                        });
                                                    }
                                                    if (hires[o.day].end) {
                                                        let e = hires[o.day].end;
                                                        $.each(e, function(d, i) {
                                                            o.ends = o.ends || {};
                                                            o.ends[d] = b.rows[d];
                                                            o.ends.regs = o.ends.regs || {};
                                                            o.ends.regs[i] = d;
                                                        });
                                                    }
                                                }
                                                dayRange.push(o);
                                            }

                                            if (debug) {
                                                console.log("");
                                                console.log("dayRange:");
                                                console.log("---------");
                                                console.log(dayRange);

                                            }



                                            // d3 elements
                                            // -----------
                                            let rentals = d3.select("#rentals");

                                            // Model
                                            // -----
                                            let models = rentals
                                                .append("div")
                                                .attr("class", "heading")

                                            models
                                                .append("div")
                                                .attr("class", "blank")

                                            models.selectAll(".model")
                                                .data(f.reg)
                                                .enter()
                                                .append("div")
                                                .attr("class", "header")
                                                .text(function(d) {
                                                    return f.bikes[d].bike;
                                                })

                                            // notes
                                            // -----
                                            let notes = rentals
                                                .append("div")
                                                .attr("class", "heading")

                                            notes
                                                .append("div")
                                                .attr("class", "blank")

                                            notes.selectAll(".note")
                                                .data(f.reg)
                                                .enter()
                                                .append("div")
                                                .attr("class", "header")
                                                .html(function(d) {
                                                    return f.bikes[d].note;
                                                })

                                            // Registrations
                                            // -------------
                                            let registrations = rentals
                                                .append("div")
                                                .attr("class", "heading")

                                            registrations
                                                .append("div")
                                                .attr("class", "blank")

                                            registrations.selectAll(".registration")
                                                .data(f.reg)
                                                .enter()
                                                .append("div")
                                                .attr("class", "header")
                                                .html(function(d) {
                                                    return d;
                                                })


                                            // Days
                                            // ----
                                            let days = d3.select("#rentals").selectAll(".days")
                                                .data(dayRange)
                                                .enter().append("div")
                                                .attr("id", function(d) {
                                                    // console.log(d);
                                                    return d.day;
                                                })
                                                .attr("class", function(d) {
                                                    if (moment(d.day).valueOf() < today) {
                                                        return "day past";
                                                    }
                                                    return "day";
                                                })
                                                .attr("style", function(d) {
                                                    if (moment(d.day).valueOf() < today) {
                                                        return "display: none";
                                                    }
                                                    return "";
                                                })
                                                .attr("onclick", "show(this);");


                                            days.append("div")
                                                .attr("class", "date")
                                                .html(function(d) {
                                                    return moment(d.day).format('ddd DD MMM').replace(" ", "<br/>");
                                                });

                                            // Months
                                            // ------

                                            let now = moment().day(1).month;

                                            for (let m = moment(minStartDate).month(); m <= moment(maxEndDate).month(); m++) {
                                                let l = moment().day(1).month(m).endOf('month').startOf('day');

                                                if (m == moment(maxEndDate).month()) {          // processing the last month?
                                                    l = moment(maxEndDate).startOf('day');
                                                }
                                                let mn = l.format("MMM");

                                                let q = $("#" + l.valueOf())
                                                    .after("<div id ='" + mn + "_rp' class='month'></div>")
                                                    .after("<div id ='" + mn + "_dc' class='month'></div>")
                                                    .after("<div id ='" + mn + "_a' class='month'></div>")
                                                    .after("<div id ='" + mn + "_rd' class='month'></div>")
                                                    .after("<div id ='" + mn + "_rr' class='month'></div>")
                                                    .after("<div id ='" + mn + "_em' class='month'></div>")
                                                    .after("<div id ='" + mn + "_om' class='month'></div>")
                                                    .after("<div id ='" + mn + "_rm' class='month'></div>")
                                                    .after("<div id ='" + mn + "_sm' class='month'></div>")
                                                    .after("<div id ='" + mn + "' class='month'></div>");

                                                let month = $('#' + mn);
                                                month.append("<div class='month'>" + mn + "</div>");

                                                let _sm = $('#' + mn + '_sm');
                                                _sm.append("<div title='starting mileage' class='date'>sm</div>");

                                                let _rm = $('#' + mn + '_rm');
                                                _rm.append("<div title='rental mileage' class='date'>rm</div>");

                                                let _om = $('#' + mn + '_om');
                                                _om.append("<div title='other mileage' class='date'>om</div>");

                                                let _em = $('#' + mn + '_em');
                                                _em.append("<div title='ending mileage' class='date'>em</div>");

                                                let _rr = $('#' + mn + '_rr');
                                                _rr.append("<div title='rental revenue (excluding extras)' class='date'>rr</div>");

                                                let _rd = $('#' + mn + '_rd');
                                                _rd.append("<div title='rental days' class='date'>rd</div>");

                                                let _a = $('#' + mn + '_a');
                                                _a.append("<div title='age (days)' class='date'>a</div>");

                                                let _dc = $('#' + mn + '_dc');
                                                _dc.append("<div title='depreciation charge' class='date'>dc</div>");

                                                let _rp = $('#' + mn + '_rp');
                                                _rp.append("<div title='revenue percentage' class='date'>rp</div>");


                                                if (l < moment().valueOf()) {
                                                    month.addClass("past").css("display", "none");
                                                    _sm.addClass("past").css("display", "none");
                                                    _rm.addClass("past").css("display", "none");
                                                    _om.addClass("past").css("display", "none");
                                                    _em.addClass("past").css("display", "none");
                                                    _rr.addClass("past").css("display", "none");
                                                    _rd.addClass("past").css("display", "none");
                                                    _a.addClass("past").css("display", "none");
                                                    _dc.addClass("past").css("display", "none");
                                                    _rp.addClass("past").css("display", "none");
                                                }

                                                $.each(f.reg, function(d, i) {
                                                    let bike = f.bikes[i];

                                                    month.append("<div class='summary' style='border-top: 1px solid black;'>&nbsp;</div>");

                                                    // starting mileage
                                                    let a = "";
                                                    if (bike.mileage && bike.mileage[m]) { a = bike.mileage[m].start; }
                                                    _sm.append("<div title='starting mileage: " + a + "' class='summary sm " + i + "'>" + a + "</div>");

                                                    // rental mileage
                                                    rentalMileage = "";
                                                    if (bike.mileage && bike.mileage[m]) { rentalMileage = bike.mileage[m].cumulative; }
                                                    _rm.append("<div title='rental mileage: " + rentalMileage + "' class='summary rm " + i + "'>" + rentalMileage + "</div>");

                                                    // other mileage
                                                    a = "";
                                                    if (bike.mileage && bike.mileage[m]) {
                                                        // a = bike.mileage[m].end - bike.mileage[m].cumulative; 
                                                        a = Math.max(bike.mileage[m].end - bike.mileage[m].cumulative - bike.mileage[m].start, 0);
                                                    }
                                                    _om.append("<div title='other mileage: " + a + "' class='summary om " + i + "'>" + a + "</div>");

                                                    // ending mileage
                                                    a = "";
                                                    if (bike.mileage && bike.mileage[m]) {
                                                        a = bike.mileage[m].end;
                                                    } else {
                                                        let mm = m;
                                                        while (mm >= moment(minStartDate).month() && a == "") {
                                                            if (bike.mileage && bike.mileage[mm]) {
                                                                a = bike.mileage[mm].end;
                                                            }
                                                            mm--;
                                                        }
                                                    }
                                                    _em.append("<div title='ending mileage: " + a + "' class='summary em " + i + " " + (a > mileageLimit ? "aged" : "") + "'>" + a + "</div>");

                                                    // rental revenue
                                                    rentalRevenue = "";
                                                    if (bike.revenue && bike.revenue[m]) { rentalRevenue = bike.revenue[m].cumulative; }
                                                    _rr.append("<div title='rental revenue: " + rentalRevenue + "' class='summary rr " + i + "'>" + rentalRevenue + "</div>");

                                                    // rental days
                                                    a = "";
                                                    if (bike.days && bike.days[m]) { a = bike.days[m] }
                                                    _rd.append("<div title='rental days: " + a + "' class='summary rd " + i + "'>" + a + "</div>");

                                                    // age
                                                    a = "";
                                                    if (bike.dofr) {
                                                        a = today.month(m).endOf('month').startOf('day').diff(bike.dofr.e, 'days');
                                                        if (a < 1) { a = "" }
                                                    }
                                                    _a.append("<div title='age (days): " + a + "' class='summary age " + i + " " + (a > ageLimitInDays ? "aged" : "") + "'>" + a + "</div>");

                                                    // depreciation charge
                                                    a = "";
                                                    if (bike.mileage && bike.mileage[m]) {

                                                        let dpm = 0.175;
                                                        let depRev = false;
                                                        let pcOfRev = 30 / 100;
                                                        let pcRevMult = 70 / 100

                                                        a = (dpm * rentalMileage * !(depRev)) + ((pcOfRev * (rentalRevenue * pcRevMult)) * (depRev));
                                                        a = parseInt(a * 100, 10) / 100;

                                                    }
                                                    _dc.append("<div title='depreciation charge: " + a + "' class='summary dc " + i + "'>" + a + "</div>");

                                                    // revenue percentage
                                                    a = "";
                                                    if (bike.mileage && bike.mileage[m]) {

                                                        let dpm = 0.175;
                                                        let depRev = true;
                                                        let pcOfRev = 30 / 100;
                                                        let pcRevMult = 70 / 100

                                                        a = (dpm * rentalMileage * !(depRev)) + ((pcOfRev * (rentalRevenue * pcRevMult)) * (depRev));
                                                        a = parseInt(a * 100, 10) / 100;

                                                    }
                                                    _rp.append("<div title='revenue percentage: " + a + "' class='summary rp " + i + "'>" + a + "</div>");


                                                })
                                            }


                                            // Cumulative
                                            // ----------
                                            let s = $("<div class='spacer'><div>&nbsp;</div></div>");
                                            let crr = $("<div id='cumulative' class='month'></div>");
                                            let crm = $("<div id='cumulative' class='month'></div>");
                                            let cdc = $("<div id='cumulative' class='month'></div>");
                                            let crp = $("<div id='cumulative' class='month'></div>");
                                            $("#rentals").append(s);
                                            $("#rentals").append(crr);
                                            $("#rentals").append(crm);
                                            $("#rentals").append(cdc);
                                            $("#rentals").append(crp);

                                            crr.append("<div class='date'>rr</div>");
                                            crm.append("<div class='date'>rm</div>");
                                            cdc.append("<div class='date'>dpm</div>");
                                            crp.append("<div class='date'>rp</div>");

                                            $.each(f.reg, function(d, i) {
                                                let bike = f.bikes[i];

                                                let cum_rr = 0;
                                                let c_rr = $('.rr.' + i);
                                                $.each(c_rr, function(e) {
                                                    cum_rr = cum_rr + parseInt(this.innerHTML || 0, 10);
                                                })
                                                crr.append("<div id='cumulative' title='rental revenue: " + cum_rr + "' class='summary' style='background: #eee'>" + cum_rr + "</div>");

                                                let cum_rm = 0;
                                                let c_rm = $('.rm.' + i);
                                                $.each(c_rm, function(e) {
                                                    cum_rm = cum_rm + parseInt(this.innerHTML || 0, 10);
                                                })
                                                crm.append("<div id='cumulative' title='rental mileage: " + cum_rr + "' class='summary' style='background: #eee'>" + cum_rm + "</div>");

                                                let cum_dc = 0;
                                                let c_dc = $('.dc.' + i);
                                                $.each(c_dc, function(e) {
                                                    cum_dc = cum_dc + parseInt(this.innerHTML || 0, 10);
                                                })
                                                cdc.append("<div id='cumulative' title='depreciation charge: " + cum_dc + "' class='summary' style='background: #eee'>" + cum_dc + "</div>");

                                                let cum_rp = 0;
                                                let c_rp = $('.rp.' + i);
                                                $.each(c_rp, function(e) {
                                                    cum_rp = cum_rp + parseInt(this.innerHTML || 0, 10);
                                                })
                                                crp.append("<div id='cumulative' title='revenue percentage: " + cum_rp + "' class='summary' style='background: #eee'>" + cum_rp + "</div>");

                                            });


                                            // Bikes
                                            // -----

                                            let regs = days.each(function(d, i) {
                                                d3.select(this).selectAll(".regs")
                                                    .data(f.reg.map(function(r) {
                                                        let reg = trimReg(r);
                                                        let row = null;
                                                        if (d.starts && d.starts.regs[reg]) {
                                                            row = d.starts.regs[reg];
                                                        }
                                                        if (d.outs && d.outs.regs[reg]) {
                                                            row = d.outs.regs[reg];
                                                        }
                                                        if (d.ends && d.ends.regs[reg]) {
                                                            row = d.ends.regs[reg];
                                                        }
                                                        return { "day": d, "row": row, "reg": reg }
                                                    }))
                                                    .enter()
                                                    .append("div")
                                                    // .attr("class", "entry reg")
                                                    .attr("reg", function(d) {
                                                        return d.reg;
                                                    })
                                                    .attr("row", function(d) {
                                                        return d.row;
                                                    })
                                                    .attr("class", function(d) {
                                                        let c = "entry";
                                                        let r = false;
                                                        let t = false;
                                                        let s = true;

                                                        //  Bike in / out of service or before dofr?
                                                        //  ----------------------------------------
                                                        if (f.bikes[d.reg] && f.bikes[d.reg].on && d.day.day < f.bikes[d.reg].on.e) {
                                                            s = false;
                                                        }
                                                        if (f.bikes[d.reg] && f.bikes[d.reg].off && d.day.day > f.bikes[d.reg].off.e) {
                                                            s = false;
                                                        }
                                                        if (f.bikes[d.reg] && d.day.day < f.bikes[d.reg].dofr.e - 1) {
                                                            s = false;
                                                        }

                                                        if (!s) { c = c + " oos"; }

                                                        // Booking confirmed?
                                                        // ------------------
                                                        if (b.rows[d.row] && b.rows[d.row].booking) {
                                                            t = $.trim(b.rows[d.row].booking.t).toLowerCase() == "confirmed";
                                                        }

                                                        if (d.day.starts && d.day.starts.regs[d.reg]) {
                                                            c = c + " start";
                                                            if (!t) { c = c + " unconfirmed" }
                                                        }
                                                        if (d.day.outs && d.day.outs.regs[d.reg]) {
                                                            c = c + " out";
                                                            if (!t) { c = c + " unconfirmed" }
                                                        }
                                                        if (d.day.ends && d.day.ends.regs[d.reg]) {
                                                            c = c + " end";
                                                            if (!t) { c = c + " unconfirmed" }
                                                        }

                                                        // Age of bike?
                                                        // ------------
                                                        if (moment(d.day.day).diff(moment(f.bikes[d.reg].dofr.e).startOf('day'), 'days') >= ageLimitInDays) {
                                                            c = c + " aged";
                                                        }

                                                        return c;
                                                    })
                                                    .attr("title", function(d) {
                                                        let oos = this.classList.value.match(/ oos/ig);
                                                        // Age of bike?
                                                        // ------------
                                                        let age = moment(d.day.day).diff(moment(f.bikes[d.reg].dofr.e).startOf('day'), 'days');
                                                        let curr = moment().startOf('day').diff(moment(f.bikes[d.reg].dofr.e).startOf('day'), 'days');
                                                        let title = "";

                                                        title = age + " days old - currently: " + curr + " days old - dofr: " + moment(f.bikes[d.reg].dofr.e).format("DD MMM YY");

                                                        // Mileage of bike?
                                                        // ----------------
                                                        // if (f.bikes[d.reg]. >= mileageLimitInDays) {
                                                        //     return age + " days old - currently: " + curr + " days old";
                                                        // }          

                                                        return !(oos) ? title : null ;

                                                    })
                                            });


                                            d3.selectAll(".entry")
                                                .append("div")
                                                .attr("class", function(d) {
                                                    return "reg";
                                                })
                                                .html(function(d) {
                                                    let reg = d.reg;
                                                    if (reg == "TBC") {
                                                        return "TBC<br/>&nbsp;";
                                                    }
                                                    return reg ? reg.match(/.{4}/ig)[0] + "<br/>" + reg.match(/.{3}$/ig)[0] : "TBC<br/>&nbsp;";
                                                });

                                            let detail = d3.selectAll(".entry")
                                                .append("div")
                                                .attr("class", function(d) {
                                                    return "detail " + d.day.day;
                                                })
                                                .attr("style", "display: none;");

                                            detail.append("div")
                                                .attr("class", "startDate")
                                                .text(function(d) {
                                                    let t = "";

                                                    if (b.rows[d.row] && b.rows[d.row].startdate) {
                                                        let s = b.rows[d.row].startdate.t.split("-");
                                                        t = t + s[0] + " " + s[1];
                                                    }

                                                    if (b.rows[d.row] && b.rows[d.row].collect) {
                                                        t = t + " " + b.rows[d.row].collect.t;
                                                    }

                                                    return t;
                                                })

                                            detail.append("div")
                                                .attr("class", "endDate")
                                                .text(function(d) {
                                                    let t = "";

                                                    if (b.rows[d.row] && b.rows[d.row].returndate) {
                                                        let s = b.rows[d.row].returndate.t.split("-");
                                                        t = t + s[0] + " " + s[1];
                                                    }

                                                    if (b.rows[d.row] && b.rows[d.row].return) {
                                                        t = t + " " + b.rows[d.row].return.t;
                                                    }

                                                    return t;
                                                })

                                            detail.append("div")
                                                .attr("class", "machine")
                                                .text(function(d) {
                                                    if (b.rows[d.row] && b.rows[d.row].machine) {
                                                        return b.rows[d.row].machine.t;
                                                    }
                                                    return "";
                                                })

                                            detail.append("div")
                                                .attr("class", "name")
                                                .text(function(d) {

                                                    if (b.rows[d.row]) {

                                                        if ($.trim(b.rows[d.row].ridername.t) != "") {
                                                            let name = $.trim(b.rows[d.row].ridername.t).split(" ");
                                                            name = name[0][0] + " " + name[1];
                                                            return name;
                                                        }

                                                        let name = $.trim(b.rows[d.row].name.t)[0] + " " + $.trim(b.rows[d.row].surname.t);
                                                        return name;
                                                    }
                                                    return "";
                                                })

                                            let bikes = detail.append("div")
                                                .attr("class", "bike");

                                            bikes.append("div")
                                                .attr("class", "gps")
                                                .html(function(d) {
                                                    if (b.rows[d.row]) {
                                                        let gps = b.rows[d.row].gps.t || false;
                                                        let nav = gps ? (gps.match(/\d\.\d\d/g) ? true : false) : false; // Sat Nav requested
                                                        return "<div><div class='bar'></div><div class='nav " + nav + "''></div><div class='bar'></div></div>";
                                                    }
                                                    return "";
                                                })

                                            let luggage = bikes.append("div")
                                                .attr("class", "luggage");

                                            luggage.append("div")
                                                .attr("class", function(d) {
                                                    if (b.rows[d.row]) {
                                                        let tbag = $.trim(b.rows[d.row].tankbag.t.toLowerCase()) == "yes" ? true : false;
                                                        return "tBag " + tbag;
                                                    }
                                                    return "";
                                                })
                                                .attr("title", function(d) {
                                                    if (b.rows[d.row]) {
                                                        let tbag = $.trim(b.rows[d.row].tankbag.t.toLowerCase()) == "yes" ? true : false;
                                                        return "Tank Bag - " + (tbag ? "" : "not ") + "required.";
                                                    }
                                                    return "";
                                                });

                                            luggage.append("div")
                                                .attr("class", function(d) {
                                                    if (b.rows[d.row]) {
                                                        let panniers = $.trim(b.rows[d.row].panniers.t.toLowerCase()) == "yes" ? true : false;
                                                        return "pannier " + panniers;
                                                    }
                                                    return "";
                                                })
                                                .attr("title", function(d) {
                                                    if (b.rows[d.row]) {
                                                        let panniers = $.trim(b.rows[d.row].panniers.t.toLowerCase()) == "yes" ? true : false;
                                                        return "Panniers - " + (panniers ? "" : "not ") + "required.";
                                                    }
                                                    return "";
                                                });

                                            luggage.append("div")
                                                .attr("class", function(d) {
                                                    if (b.rows[d.row]) {
                                                        let tbox = $.trim(b.rows[d.row].topbox.t.toLowerCase()) == "yes" ? true : false;
                                                        return "tBox " + tbox;
                                                    }
                                                    return "";
                                                })
                                                .attr("title", function(d) {
                                                    if (b.rows[d.row]) {
                                                        let tbox = $.trim(b.rows[d.row].topbox.t.toLowerCase()) == "yes" ? true : false;
                                                        return "Top Box - " + (tbox ? "" : "not ") + "required.";
                                                    }
                                                    return "";
                                                });

                                            luggage.append("div")
                                                .attr("class", function(d) {
                                                    if (b.rows[d.row]) {
                                                        let panniers = $.trim(b.rows[d.row].panniers.t.toLowerCase()) == "yes" ? true : false;
                                                        return "pannier " + panniers;
                                                    }
                                                    return "";
                                                })
                                                .attr("title", function(d) {
                                                    if (b.rows[d.row]) {
                                                        let panniers = $.trim(b.rows[d.row].panniers.t.toLowerCase()) == "yes" ? true : false;
                                                        return "Panniers - " + (panniers ? "" : "not ") + "required.";
                                                    }
                                                    return "";
                                                });

                                            return data;
                                        })
                                }
                                return data;
                            })


                    })
                    .catch(function(error) {
                        showError(endpoint, error);
                    });
            } else {
                response.json()
                    .then(function(data) {
                        // Display response as error in the page
                        showError(endpoint, data);
                    })
                    .catch(function(error) {
                        showError(endpoint, error);
                    });
            }
        })
        .catch(function(error) {
            showError(endpoint, error);
        });
}

/**
 * Sign-out the user
 */
function signOut() {
    userAgentApplication.logout();
}

function trimDate(date) {

    console.log(date);
    if (!date || date == "") {
        return "";
    }

    let s = {};
    s.p = $.trim(date).split("-");
    s.d = s.p[0];
    s.m = moment().month(s.p[1]).format("M") - 1;
    s.y = "20" + s.p[2];
    s.e = moment([s.y, s.m, s.d]).valueOf();

    return s;
}


function trimReg(registration) {
    reg = $.trim(registration);
    reg = reg.replace(/\s+/g, '');
    return reg;
}

function show(e) {
    let el = $('#' + e.id + ' .detail');

    if (e == 'past') {
        el = $('.past');
    }

    if (el.css('display') != 'none') {
        el.hide('slow');
    } else {
        el.show('slow');
    }
}

$('h1').click(function() {
    show('past');
});