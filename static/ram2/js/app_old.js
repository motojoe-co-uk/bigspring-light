// Graph API endpoint to show user profile
// let graphApiEndpoint = "https://graph.microsoft.com/v1.0/drives/b!ke3cURxhuEOowDZ8Isx-b0DoOZc1X_lKjcVghFA_3dDELeTyyf9jSKXnDV2F4sCZ/items/01GGBEMY4W4LM2QNPXABAKEYIJXUPIOEQW/children?$filter=startswith(name,'1 Fleet Allocation')";
let graphApiEndpoint = "https://graph.microsoft.com/v1.0/drives/b!ke3cURxhuEOowDZ8Isx-b0DoOZc1X_lKjcVghFA_3dDELeTyyf9jSKXnDV2F4sCZ/items/01GGBEMY3Y7WYSZFQVLVALHQYPPZIFCR22/workbook/worksheets/Bookings/UsedRange";
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
    var user = userAgentApplication.getUser();
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
        userInfoElement.parentElement.classList.remove("hidden");
        userInfoElement.innerHTML = JSON.stringify(user, null, 4);

        // Show Sign-Out button
        document.getElementById("signOutButton").classList.remove("hidden");

        // Now Call Graph API to show the user profile information:
        var graphCallResponseElement = document.getElementById("graphResponse");
        graphCallResponseElement.parentElement.classList.remove("hidden");
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

                        console.log(data);

                        // Display response in the page
                        // responseElement.innerHTML = JSON.stringify(data, null, 4);
                        // if (showTokenElement) {
                        //     showTokenElement.parentElement.classList.remove("hidden");
                        //     showTokenElement.innerHTML = token;
                        // }

                        return data;
                    })
                    .then(function(data) {

                        var headings = data.text[0];
                        var columns = ["Name",
                            "Surname",
                            "Machine",
                            // "Date Confirmed",
                            "Reg No",
                            // "MID",
                            "Panniers",
                            "Top-Box",
                            "Tank-Bag",
                            "ETA",
                            "Start date",
                            "Return date",
                            // "days",
                            // "Booking",
                            // "rental",
                            // "Ins (non-UK)",
                            "GPS",
                            // "Extra Charges",
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
                            // "Rider Name",
                            // "Start date",
                            // "Return date",
                            // "days",
                            // "Machine",
                            // "Reg No",
                            // "rental",
                            // "Start Mileage",
                            // "Finish Mileage",
                            // "Total Miles",
                            // "Average Miles/day",
                            // "Damage Invoiced",
                            // "Thank you email date",
                            // "Comments"
                        ];
                        var rows = [];

                        for (let i = 1; i < data.rowCount; i++) {
                            let t = data.text[i] || null;
                            let v = data.values[i] || null;

                            if (t[[0]] != "") {
                                // console.log("row " + i);
                                // console.log(r);
                                let o = {};

                                $.each(columns, function(j, f) {

                                    let nf = f.toLowerCase().replace(/[ |\-]/ig, "");

                                    o[nf] = {};
                                    o[nf].v = v[headings.indexOf(f)];
                                    o[nf].t = t[headings.indexOf(f)];
                                });

                                rows.push(o);
                            }
                        }

                        console.log("rows");
                        console.log(rows);

                        // Set up key dates
                        // ----------------
                        const today = moment().startOf('day');
                        const startOfYear = moment().startOf('year');
                        const endOfYear = moment().endOf('year');


                        // unique rental dates (start)
                        // ---------------------------
                        var out = d3.nest()
                            .key(function(d) { return new Date(d.startdate.t).getTime(); })
                            .rollup(function(d) {
                                let dt = new Date(d[0].startdate.t);
                                if (dt < startOfYear) {
                                    alert("detected start date before start of year for: \n" + JSON.stringify(d, 2));
                                    console.error(d);
                                }
                                if (dt > endOfYear) {
                                    alert("detected start date after of year for: \n" + JSON.stringify(d, 2));
                                    console.error(d);
                                }

                                return {
                                    "v": d[0].startdate.v,
                                    "t": d[0].startdate.t,
                                    "date": dt,
                                    "out": d.length,
                                    "rows": d
                                }
                            })
                            .map(rows);

                        // console.dir(out);


                        // unique rental dates (return)
                        // ---------------------------
                        var back = d3.nest()
                            .key(function(d) { return new Date(d.returndate.t).getTime(); })
                            .rollup(function(d) {
                                let dt = new Date(d[0].returndate.t);
                                if (dt < startOfYear) {
                                    alert("detected return date before start of year for: \n" + JSON.stringify(d, 2));
                                    console.error(d);
                                }
                                if (dt > endOfYear) {
                                    alert("detected return date after of year for: \n" + JSON.stringify(d, 2));
                                    console.error(d);
                                }
                                return {
                                    "v": d[0].returndate.v,
                                    "t": d[0].returndate.t,
                                    "date": new Date(d[0].returndate.t),
                                    "in": d.length,
                                    "rows": d
                                }
                            })
                            .map(rows);

                        // console.dir(back);


                        // Set up key dates
                        // ----------------
                        let minStartDate = d3.min(rows, function(d) {
                            let s = new Date(d.startdate.t).getTime();
                            if (s >= startOfYear.valueOf() && s <= endOfYear.valueOf()) {
                                return s;
                            }
                        });
                        let maxStartDate = d3.max(rows, function(d) {
                            let s = new Date(d.startdate.t).getTime();
                            if (s >= startOfYear.valueOf() && s <= endOfYear.valueOf()) {
                                return s;
                            }
                        });
                        let maxEndDate = d3.max(rows, function(d) {
                            let s = new Date(d.returndate.t).getTime();
                            if (s >= startOfYear.valueOf() && s <= endOfYear.valueOf()) {
                                return s;
                            }
                        });

                        console.log(minStartDate + " " + new Date(minStartDate));
                        console.log(maxStartDate + " " + new Date(maxStartDate));
                        console.log(maxEndDate + " " + new Date(maxEndDate));


                        // d3 elements
                        // -----------
                        var rentals = d3.select("#rentals");


                        // for each day in range
                        // ---------------------
                        let dayRange = [];
                        for (let day = moment(minStartDate); day <= moment(maxEndDate); day = day.add(1, 'day')) {
                            // console.log(day.format("DD MMM"));
                            dayRange.push(day.valueOf());
                        }

                        // console.log(dayRange);

                        let days = rentals.selectAll("div")
                            .data(dayRange)
                            .enter().append("div")
                            // .text(function(d) {
                            //     return moment(d).format('DD MMM');
                            // })
                            .attr("id", function(d) {
                                return d;
                            })
                            .attr("out", function(d) {
                                let o = out["$" + d] ? out["$" + d].out : null;
                                return o;
                            })
                            .attr("in", function(d) {
                                let o = back["$" + d] ? back["$" + d].in : null;
                                return o;
                            })
                            .attr("class", function(d) {
                                if (moment(d).valueOf() < today) {
                                    return "dayDiv past"
                                }
                                return "dayDiv";
                            })
                            .attr("style", function(d) {
                                if (moment(d).valueOf() < today) {
                                    return "display: none;"
                                }
                                return "";
                            })
                            .attr("onclick", "show(this);");


                        days.each(function(d) {
                            d3.select(this).append("div")
                                .attr("class", "dayDate")
                                .html(moment(d).format('ddd DD MMM').replace(" ", "<br/>"))
                        });

                        let dayEntries = d3.select(".dayDiv")
                            .append("div")
                                .datum(function(d) {
                                    return {
                                        "out": out["$" + d] || null,
                                        "in": back["$" + d] || null
                                    }
                                })
                                .attr("out", function(d){
                                    return d.out;
                                })
                                .attr("in", function(d){
                                    return d.in;
                                })
                                .attr("class", "dayEntry");
                        

                        console.dir(dayEntries);


                        let entries = dayEntries.each(function(d) {
                            d3.select(this).selectAll(".dayEntries")
                                .data(function(d) {
                                    console.log(d);
                                    if (d.out) {
                                        // console.log(out["$" + d].rows);
                                        return d.out.rows;
                                    }
                                    return false;
                                })
                                .enter()
                                .append("div")
                                .attr("class", "entry")
                            });


                        // let entries = dayEntries.each(function(d) {
                        //     d3.select(this)
                        //         .append("div")
                        //         .attr("data", function(d) {
                        //             console.log(d);
                        //             return JSON.stringify(d);
                        //         })
                        //         .text(function(d) {
                        //             return JSON.stringinfy(d);
                        //         });
                        //     });

                        // entries.each(function(d, i) {
                        //     d3.select(this).selectAll(".rentals")
                        //         .data(function(d) {
                        //             // console.log(d3.select(this));
                        //             if (out["$" + d]) {
                        //                 return out["$" + d].rows;
                        //             }
                        //             return false;
                        //         })
                        //         .enter()
                        //         .append("div")
                        //         .attr("class", "yellow")
                        //         .html(function(d) {
                        //             return d.regno.t ? d.regno.t.match(/.{4}/ig)[0] + "<br/>" + d.regno.t.match(/.{3}$/ig)[0] : "TBC<br/>&nbsp;";
                        //         })
                        //         .attr("id", function(d) {
                        //             return d.regno.t;
                        //         })
                            // });

                        // console.log(days);

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


function show(e) {

    let el = $('.' + e.id + '.detail');
    if (e == 'past') {
        el = $('.past');
    }

    if (el.css('display') == 'none') {
        el.show('slow');
    } else {
        el.hide('slow');
    }
}

$('h1').click(function() {
    show('past');
});

// let request = obj => {
//     return new Promise((resolve, reject) => {
//         let xhr = new XMLHttpRequest();
//         xhr.open(obj.method || "GET", obj.url);
//         if (obj.headers) {
//             Object.keys(obj.headers).forEach(key => {
//                 xhr.setRequestHeader(key, obj.headers[key]);
//             });
//         }
//         xhr.onload = () => {
//             if (xhr.status >= 200 && xhr.status < 300) {
//                 resolve(xhr.response);
//             } else {
//                 reject(xhr.statusText);
//             }
//         };
//         xhr.onerror = () => reject(xhr.statusText);
//         xhr.send(obj.body);
//     });
// };