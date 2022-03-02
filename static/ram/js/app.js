const debug = true;
const SERVICE_WARNING = 1000;
const SERVICE_ALARM = 500;
const TURNAROUND_WARNING = 6;
const TURNAROUND_ALARM = 3;

const drive =
  'b!ke3cURxhuEOowDZ8Isx-b0DoOZc1X_lKjcVghFA_3dDELeTyyf9jSKXnDV2F4sCZ';
const workbook = '01GGBEMY5JVT2ZGVLZKZFL3ACT6VIZEL5B';

// Graph API endpoint
// let graphApiEndpoint = "https://graph.microsoft.com/v1.0/drives/" + drive + "/items/" + workbook + "/workbook/worksheets/bookings/UsedRange";
let graphApiEndpoint =
  'https://graph.microsoft.com/v1.0/drives/' + drive + '/items/' + workbook;
// Graph API scope used to obtain the access token to read user profile
let graphAPIScopes = ['https://graph.microsoft.com/Files.Read.All'];

// Initialize application
let userAgentApplication = new Msal.UserAgentApplication(
  msalconfig.clientID,
  null,
  loginCallback,
  {
    redirectUri: msalconfig.redirectUri
  }
);

//Previous version of msal uses redirect url via a property
if (userAgentApplication.redirectUri) {
  userAgentApplication.redirectUri = msalconfig.redirectUri;
}

window.onload = function() {
  // If page is refreshed, continue to display user info
  if (
    !userAgentApplication.isCallback(window.location.hash) &&
    window.parent === window &&
    !window.opener
  ) {
    var user = userAgentApplication.getUser();
    if (user) {
      callGraphApi();
    }
  }
};

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
    var userInfoElement = document.getElementById('userInfo');
    // userInfoElement.parentElement.classList.remove("hidden");
    userInfoElement.innerHTML = JSON.stringify(user, null, 4);

    // Show Sign-Out button
    document.getElementById('signOutButton').classList.remove('hidden');

    // Now Call Graph API to show the user profile information:
    var graphCallResponseElement = document.getElementById('graphResponse');
    // graphCallResponseElement.parentElement.classList.remove("hidden");
    graphCallResponseElement.innerText = 'Calling Graph ...';

    // In order to call the Graph API, an access token needs to be acquired.
    // Try to acquire the token used to query Graph API silently first:
    userAgentApplication.acquireTokenSilent(graphAPIScopes).then(
      function(token) {
        //After the access token is acquired, call the Web API, sending the acquired token
        callWebApiWithToken(
          graphApiEndpoint,
          token,
          graphCallResponseElement,
          document.getElementById('accessToken')
        );
      },
      function(error) {
        // If the acquireTokenSilent() method fails, then acquire the token interactively via acquireTokenRedirect().
        // In this case, the browser will redirect user back to the Azure Active Directory v2 Endpoint so the user
        // can reenter the current username/ password and/ or give consent to new permissions your application is requesting.
        // After authentication/ authorization completes, this page will be reloaded again and callGraphApi() will be executed on page load.
        // Then, acquireTokenSilent will then get the token silently, the Graph API call results will be made and results will be displayed in the page.
        if (error) {
          userAgentApplication.acquireTokenRedirect(graphAPIScopes);
        }
      }
    );
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
  document.getElementById('errorMessage').innerHTML =
    'An error has occurred:<br/>Endpoint: ' +
    endpoint +
    '<br/>Error: ' +
    formattedError +
    '<br/>' +
    errorDesc;
  console.error(error);
}

/**
 * Call a Web API using an access token.
 * @param {any} endpoint - Web API endpoint
 * @param {any} token - Access token
 * @param {object} responseElement - HTML element used to display the results
 * @param {object} showTokenElement = HTML element used to display the RAW access token
 */
function callWebApiWithToken(
  endpoint,
  token,
  responseElement,
  showTokenElement
) {
  // alert("@callWebApiWithToken()");
  var headers = new Headers();
  var bearer = 'Bearer ' + token;
  headers.append('Authorization', bearer);
  var options = {
    method: 'GET',
    headers: headers
  };

  fetch(
    endpoint + '/workbook/worksheets/Fleet%20Allocation/UsedRange',
    options
  ).then(function(response) {
    var contentType = response.headers.get('content-type');
    if (
      response.status === 200 &&
      contentType &&
      contentType.indexOf('application/json') !== -1
    ) {
      response.json().then(function(data) {
        if (debug) {
          console.log('');
          console.log('Fleet Allocation');
          console.log('================');
          console.dir(data);
        }

        // Fetch Bike Registrations (Fleet Allocation)
        // -------------------------------------------

        let bikes = {};

        $.each(data.text[9], function(r) {
          // let bike = data.text[6][r];
          // let note = data.text[7][r];
          // let gps = data.text[8][r];
          // let reg = trimReg(data.text[9][r]);
          // let treg = trimReg(reg);
          // let dofr = data.text[10][r];
          // let on = data.text[11][r];
          // let off = data.text[12][r];
          // let lmiles = data.text[13][r];
          // let sdmil = data.text[14][r];
          // let sddate = data.text[15][r];
          
          let bike = data.text[6][r];
          let tbox = data.text[7][r];
          let pannier = data.text[8][r];
          let tbag = data.text[9][r];
          let gps = data.text[10][r];
          let bars = data.text[11][r];
          let reg = trimReg(data.text[12][r]);
          let treg = trimReg(reg);
          let dofr = data.text[13][r];
          let on = data.text[14][r];
          let off = data.text[15][r];
          let lmiles = data.text[16][r];
          let sdmil = data.text[17][r];
          let sddate = data.text[18][r];

          //   console.log('bike: ' + bike);
          //   console.log('note: ' + note);
          //   console.log('gps: ' + gps);
          //   console.log('reg: ' + reg);
          //   console.log('treg: ' + treg);
          //   console.log('dofr: ' + dofr);
          //   console.log('on: ' + on);
          //   console.log('off: ' + off);
          //   console.log('lmiles: ' + lmiles);
          //   console.log('sdmil: ' + sdmil);
          //   console.log('sddate: ' + sddate);

          if (reg != '') {
            bikes[treg] = {};
            bikes[treg].bike = $.trim(bike);
            // bikes[treg].note = $.trim(note);
            bikes[treg].gps = $.trim(gps);
            bikes[treg].on = trimDate(on);
            bikes[treg].off = trimDate(off);
            bikes[treg].dofr = trimDate(dofr);
            bikes[treg].lmiles = $.trim(lmiles);
            bikes[treg].sdmil = $.trim(sdmil);
            bikes[treg].sddate = trimDate(sddate);
            bikes[treg].daysold = moment()
              .startOf('day')
              .diff(bikes[treg].dofr.e, 'days');

            bikes[treg].smiles = sdmil - lmiles;
          }
        });

        if (debug) {
          console.log('');
          console.log('Bikes');
          console.log('=====');
          console.dir(bikes);
        }

        fetch(endpoint + '/workbook/worksheets/bookings/UsedRange', options)
          .then(function(response) {
            var contentType = response.headers.get('content-type');
            if (
              response.status === 200 &&
              contentType &&
              contentType.indexOf('application/json') !== -1
            ) {
              response
                .json()
                .then(function(data) {
                  if (debug) {
                    console.log('');
                    console.log('Bookings');
                    console.log('========');
                    console.dir(data);
                  }

                  // Display response in the page
                  // responseElement.innerHTML = JSON.stringify(data, null, 4);
                  // if (showTokenElement) {
                  //     showTokenElement.parentElement.classList.remove("hidden");
                  //     showTokenElement.innerHTML = token;
                  // }

                  return data;
                })
                .then(function(d) {
                  let s = {};
                  s.bookings = d;
                  s.bikes = bikes;

                  if (debug) {
                    console.log('');
                    console.log('Aggregated Sheets');
                    console.log('=================');
                    console.dir(s);
                  }

                  return s;
                })
                .then(function(data) {
                  // console.dir("data -->");
                  // console.dir(data);

                  var headings = data.bookings.values[0];
                  var columns = [
                    'Name',
                    'Surname',
                    'Machine',
                    // "Date Confirmed",
                    'Reg No',
                    // "MID",
                    'Panniers',
                    'Top-Box',
                    'Tank-Bag',
                    'Tour',
                    'Kit',
                    'ETA',
                    'Start date',
                    'Collect',
                    'Return date',
                    'Return',
                    // "days",
                    // "Booking",
                    // "rental",
                    // "Ins (non-UK)",
                    'GPS',
                    // "Extra Charges",
                    // "Balance Due",
                    // "Card on file",
                    // "Rider Name",
                    // "Email Address",
                    // "Street",
                    // "Town",
                    // "County",
                    // "Postcode",
                    'Country'
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

                  for (let i = 1; i < data.bookings.rowCount; i++) {
                    let t = data.bookings.text[i] || null;
                    let v = data.bookings.values[i] || null;

                    if (t[[0]] != '') {
                      // console.log("row " + i);
                      // console.log(r);
                      let o = {};

                      $.each(columns, function(j, f) {
                        let nf = f.toLowerCase().replace(/[ |\-]/gi, '');

                        o[nf] = {};
                        o[nf].v = v[headings.indexOf(f)];
                        o[nf].t = t[headings.indexOf(f)];
                      });

                      rows.push(o);
                    }
                  }

                  rows.sort(function(x, y) {
                    // console.log(x);
                    if (x.startdate.v < y.startdate.v) return -1;
                    if (y.startdate.v < x.startdate.v) return 1;
                    return 0;
                  });

                  // $.each(rows, function(x,y) {
                  //  // console.log(x);
                  //  console.dir(y.startdate.v);
                  // })

                  if (debug) {
                    console.log('');
                    console.log('rows');
                    console.log('======');
                    console.dir(rows);
                  }

                  // Set up key dates
                  // ----------------
                  const today = moment().startOf('day');
                  const startOfYear = moment().startOf('year');
                  const endOfYear = moment().endOf('year');

                  let minStartDate = endOfYear.valueOf();
                  let maxStartDate = startOfYear.valueOf();
                  let maxEndDate = startOfYear.valueOf();

                  let hires = {};
                  $.each(rows, function(r) {
                    let s = {};
                    s.p = rows[r].startdate.t.split('-');
                    s.d = s.p[0];
                    s.m =
                      moment()
                        .month(s.p[1])
                        .format('M') - 1;
                    s.y = '20' + s.p[2];
                    s.e = moment([s.y, s.m, s.d]).valueOf();

                    let e = {};
                    e.p = rows[r].returndate.t.split('-');
                    e.d = e.p[0];
                    e.m =
                      moment()
                        .month(e.p[1])
                        .format('M') - 1;
                    e.y = '20' + e.p[2];
                    e.e = moment([e.y, e.m, e.d]).valueOf();

                    // let s = moment(rows[r].startdate.t, "DD-MMM-YY").valueOf();
                    // let e = moment(rows[r].returndate.t, "DD-MMM-YY").valueOf();

                    // check for first and last dates
                    minStartDate = s.e < minStartDate ? s.e : minStartDate;
                    maxStartDate = s.e > maxStartDate ? s.e : maxStartDate;
                    maxEndDate = e.e > maxEndDate ? e.e : maxEndDate;

                    hires[s.e] = hires[s.e] || [];
                    // hires[s].date = new Date(s);
                    hires[s.e].start = hires[s.e].start || [];
                    hires[s.e].start.push(r);

                    hires[e.e] = hires[e.e] || [];
                    // hires[e].date = new Date(e);
                    hires[e.e].end = hires[e.e].end || [];
                    hires[e.e].end.push(r);
                  });

                  // if (debug) {
                  //     console.log("");
                  //     console.log("hires");
                  //     console.log("====");
                  //     console.dir(hires);
                  // }

                  for (let h in hires) {
                    let d = hires[h];

                    if (d.start && d.start.length > 1) {
                      let a = d.start;

                      a.sort(function(a, b) {
                        return rows[a].collect.v - rows[b].collect.v;
                      });
                    }

                    if (d.end && d.end.length > 1) {
                      let a = d.end;

                      a.sort(function(a, b) {
                        return rows[a].collect.v - rows[b].collect.v;
                      });
                    }
                  }

                  if (debug) {
                    console.log('');
                    console.log('hires');
                    console.log('====');
                    console.dir(hires);
                  }

                  // console.log(minStartDate + " " + new Date(minStartDate));
                  // console.log(maxStartDate + " " + new Date(maxStartDate));
                  // console.log(maxEndDate + " " + new Date(maxEndDate));

                  // for each day in range
                  // ---------------------
                  let dayRange = [];

                  for (
                    let day = moment(minStartDate);
                    day <= moment(maxEndDate);
                    day.add(1, 'day')
                  ) {
                    dayRange.push(day.startOf('day').valueOf());
                  }

                  // d3 elements
                  // -----------
                  let rentals = d3.select('#rentals');

                  let days = d3
                    .select('#rentals')
                    .selectAll('.days')
                    .data(dayRange)
                    .enter()
                    .append('div')
                    .attr('id', function(d) {
                      // console.log(d);
                      return d;
                    })
                    .attr('out', function(d) {
                      let o =
                        hires[d] && hires[d].start
                          ? hires[d].start.length
                          : null;
                      return o;
                    })
                    .attr('in', function(d) {
                      let i =
                        hires[d] && hires[d].end ? hires[d].end.length : null;
                      return i;
                    })
                    .attr('class', function(d) {
                      let c = 'day';
                      if (moment(d).valueOf() < today) {
                        c = c + ' past';
                      }
                      if (moment(d).day() == 0) {
                        c = c + ' weekend';
                      }
                      if (moment(d).day() == 1) {
                        c = c + ' weekend';
                      }
                      return c;
                    })
                    .attr('style', function(d) {
                      if (moment(d).valueOf() < today) {
                        return 'display: none';
                      }
                      return '';
                    })
                    .attr('onclick', 'show(this);');

                  days
                    .append('div')
                    .attr('class', function(d) {
                      let c = 'date';
                      if (moment(d).day() == 0) {
                        c = c + ' weekend';
                      }
                      if (moment(d).day() == 1) {
                        c = c + ' weekend';
                      }
                      return c;
                    })
                    .html(function(d) {
                      return moment(d)
                        .format('ddd DD MMM')
                        .replace(' ', '<br/>');
                    });

                  let outs = days.each(function(d) {
                    d3.select(this)
                      .selectAll('.outs')
                      .data(function(d) {
                        // console.log(hires[d]);
                        if (hires[d] && hires[d].start) {
                          return hires[d].start;
                        }
                        return false;
                      })
                      // .sort(function(a, b) {
                      //  console.log(a);
                      //                  let x = rows[a].collect;
                      //                  let y = rows[b].collect;

                      //                  if (x != undefined && x.v != undefined) {
                      //                  x = x.v;
                      //                  }
                      //                  else {
                      //                      x = 1;
                      //                  }
                      //                  if (y != undefined && y.v != undefined) {
                      //                  y = y.v;
                      //                  }
                      //                  else {
                      //                      y = 1;
                      //                  }

                      //                  // console.log(x);

                      // return (y - x);
                      // })
                      .enter()
                      .append('div')
                      .attr('class', 'entry out')
                      .attr('row', function(d) {
                        return d;
                      });
                    // .text(function(d) {
                    //     return "..." + rows[d].regno.t;
                    // })
                  });

                  let ins = days.each(function(d) {
                    d3.select(this)
                      .selectAll('.ins')
                      .data(function(d) {
                        // console.log(hires[d]);
                        if (hires[d] && hires[d].end) {
                          return hires[d].end;
                        }
                        return false;
                      })
                      .enter()
                      .append('div')
                      .attr('class', 'entry in')
                      .attr('row', function(d) {
                        return d;
                      });
                    // .text(function(d) {
                    //     return "..." + rows[d].regno.t;
                    // })
                  });

                  d3.selectAll('.entry')
                    .append('div')
                    .attr('class', function(d) {
                      var c = 'reg';

                      if ($(this).parent('.in').length) {
                        // console.log(" in: " + $(this).parent());
                        c = c + ' in';
                      } else {
                        // console.log("out: " + $(this).parent());
                        c = c + ' out';
                      }
                      let tour =
                        $.trim(rows[d].tour.t.toLowerCase()) == 'yes'
                          ? 'tour'
                          : '';

                      if (tour) {
                        c = c + ' tour';
                      }

                      return c;
                    })
                    .html(function(d) {
                      let reg = rows[d].regno ? rows[d].regno.t : null;
                      if (reg == 'TBC') {
                        reg = null;
                      }
                      return reg
                        ? reg.match(/.{4}/gi)[0] +
                            '<br/>' +
                            reg.match(/.{3}$/gi)[0]
                        : 'TBC<br/>&nbsp;';
                    });

                  let detail = d3
                    .selectAll('.entry')
                    .append('div')
                    .attr('class', function(d) {
                      var c = 'detail ';
                      if ($(this).parent('.in').length) {
                        c = c + 'in ';
                      } else {
                        c = c + 'out ';
                      }

                      return c + d;
                    })
                    .attr('style', 'display: none;');

                  detail
                    .append('div')
                    .attr('class', function(d) {
                      var c = 'startDate';

                      if ($(this).parent('.in').length) {
                        console.log('in');
                        c = c + ' in';
                      } else {
                        c = c + ' out';
                      }
                      return c;
                    })
                    .text(function(d) {
                      let t = '';
                      let s = rows[d].startdate.t.split('-');
                      t = s[0] + ' ' + s[1];

                      if (rows[d].collect) {
                        t = t + ' ' + rows[d].collect.t;
                      }

                      return t;
                    });

                  detail
                    .append('div')
                    .attr('class', function(d) {
                      var c = 'endDate';

                      if ($(this).parent('.in').length) {
                        console.log('in');
                        c = c + ' in';
                      } else {
                        c = c + ' out';
                      }
                      return c;
                    })
                    .text(function(d) {
                      let t = '';
                      let e = rows[d].returndate.t.split('-');
                      t = e[0] + ' ' + e[1];

                      if (rows[d].return) {
                        t = t + ' ' + rows[d].return.t;
                      }

                      return t;
                    });

                  detail
                    .append('div')
                    .attr('class', 'machine')
                    .text(function(d) {
                      // console.log(rows[d].machine.t)
                      return rows[d].machine.t;
                    });

                  detail
                    .append('div')
                    .attr('class', 'name')
                    .text(function(d) {
                      let name =
                        $.trim(rows[d].name.t)[0] +
                        ' ' +
                        $.trim(rows[d].surname.t);
                      // console.log(name);
                      return name;
                    });

                  detail
                    .append('div')
                    .attr('class', function(d) {
                      let c = 'mileage';
                      let reg = rows[d].regno ? rows[d].regno.t : false;
                      if (reg) {
                        reg = trimReg(reg);

                        if (data.bikes[reg] && data.bikes[reg].smiles) {
                          if (data.bikes[reg].smiles < SERVICE_WARNING) {
                            c = c + ' amber';
                          }
                          if (data.bikes[reg].smiles < SERVICE_ALARM) {
                            c = c + ' red';
                          }
                        }
                      }
                      return c;
                    })
                    .text(function(d) {
                      let reg = rows[d].regno ? rows[d].regno.t : false;
                      if (reg) {
                        reg = trimReg(reg);

                        // console.log("LOOKING FOR: " + reg);

                        let miles = 0;

                        if (data.bikes[reg]) {
                          let bike = data.bikes[reg];

                          if (bike.lmiles) {
                            miles = bike.lmiles + ' [' + bike.smiles + ']';
                            // console.log("  MILES: " + miles);
                          }

                          // if (bike.smiles) {
                          //     smiles = bike.sdmil;
                          //     console.log("  SMILES: " + smiles);
                          // }
                        }

                        return miles;
                      }
                      return 'unknown';
                    });

                  detail
                    .append('div')
                    .attr('class', 'nextout')
                    .html(function(d) {
                      for (var i = d + 1; i < rows.length; i++) {
                        if (rows[d].regno.t == rows[i].regno.t) {
                          if (rows[d].returndate && rows[i].startdate) {
                            let aa = moment(rows[i].startdate.t, 'DD-MMM-YYYY');
                            let bb = moment(
                              rows[d].returndate.t,
                              'DD-MMM-YYYY'
                            );

                            let ta = 0;

                            for (
                              let dt = moment(aa);
                              dt.diff(bb) > 0;
                              dt.add(-1, 'days')
                            ) {
                              if (moment(dt).day() > 1) {
                                ta++;
                              }
                            }

                            let msg =
                              'next: ' +
                              (rows[i].startdate.v - rows[d].returndate.v) +
                              ' / ' +
                              ta +
                              ' days';

                            if (ta < TURNAROUND_ALARM) {
                              msg = "<span class='red'>" + msg + '</span>';
                              return msg;
                            }

                            if (ta < TURNAROUND_WARNING) {
                              msg = "<span class='amber'>" + msg + '</span>';
                              return msg;
                            }

                            return msg;
                          }
                        }
                      }

                      return '-';
                    });

                  let bikes = detail.append('div').attr('class', 'bike');

                  bikes
                    .append('div')
                    .attr('class', function(d) {
                      return 'gps';
                    })
                    .html(function(d) {
                      let gps = rows[d].gps.v > 0;
                      let tour =
                        $.trim(rows[d].tour.t.toLowerCase()) == 'yes'
                          ? 'tour'
                          : '';

                      return (
                        "<div><div class='bar'></div><div class='nav " +
                        gps +
                        ' ' +
                        tour +
                        "''></div><div class='bar'></div></div>"
                      );
                    })
                    .attr('title', function(d) {
                      let tour =
                        $.trim(rows[d].tour.t.toLowerCase()) == 'yes'
                          ? true
                          : false;
                      if (tour) {
                        return 'NAV & ROUTE - required.';
                      }

                      let gps = rows[d].gps.v > 0;
                      return 'NAV - ' + (gps ? '' : 'not ') + 'required.';
                    });

                  let luggage = bikes.append('div').attr('class', 'luggage');

                  luggage
                    .append('div')
                    .attr('class', function(d) {
                      let tbag =
                        $.trim(rows[d].tankbag.t.toLowerCase()) == 'yes'
                          ? true
                          : false;
                      return 'tBag ' + tbag;
                    })
                    .attr('title', function(d) {
                      let tbag =
                        $.trim(rows[d].tankbag.t.toLowerCase()) == 'yes'
                          ? true
                          : false;
                      return 'Tank Bag - ' + (tbag ? '' : 'not ') + 'required.';
                    });

                  luggage
                    .append('div')
                    .attr('class', function(d) {
                      let panniers =
                        $.trim(rows[d].panniers.t.toLowerCase()) == 'yes'
                          ? true
                          : false;
                      return 'pannier ' + panniers;
                    })
                    .attr('title', function(d) {
                      let panniers =
                        $.trim(rows[d].panniers.t.toLowerCase()) == 'yes'
                          ? true
                          : false;
                      return (
                        'Panniers - ' + (panniers ? '' : 'not ') + 'required.'
                      );
                    });

                  luggage
                    .append('div')
                    .attr('class', function(d) {
                      let tbox =
                        $.trim(rows[d].topbox.t.toLowerCase()) == 'yes'
                          ? true
                          : false;
                      return 'tBox ' + tbox;
                    })
                    .attr('title', function(d) {
                      let tbox =
                        $.trim(rows[d].topbox.t.toLowerCase()) == 'yes'
                          ? true
                          : false;
                      return 'Top Box - ' + (tbox ? '' : 'not ') + 'required.';
                    });

                  luggage
                    .append('div')
                    .attr('class', function(d) {
                      let panniers =
                        $.trim(rows[d].panniers.t.toLowerCase()) == 'yes'
                          ? true
                          : false;
                      return 'pannier ' + panniers;
                    })
                    .attr('title', function(d) {
                      let panniers =
                        $.trim(rows[d].panniers.t.toLowerCase()) == 'yes'
                          ? true
                          : false;
                      return (
                        'Panniers - ' + (panniers ? '' : 'not ') + 'required.'
                      );
                    });

                  let kit = bikes
                    .append('div')
                    .attr('class', 'kit')
                    .html(function(d) {
                      let kit = $.trim(rows[d].kit.t.toLowerCase());

                      if (kit == 'yes') {
                        return "<img src='img/kit.png' title='Kit required'/>";
                      }
                      return '';
                    });
                })
                .catch(function(error) {
                  showError(endpoint, error);
                });
            } else {
              response
                .json()
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
      });
    }
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
  if (!date || date == '') {
    return '';
  }
  console.log('processing: ' + date);

  let s = {};
  s.p = $.trim(date).split('-');
  s.d = s.p[0];
  s.m =
    moment()
      .month(s.p[1])
      .format('M') - 1;
  s.y = '20' + s.p[2];
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
