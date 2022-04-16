
// rules
// ------------------------------------
// weekend = daily rate * 2 * 1.1
// Week = daily rate * 7 * 0.878857143    // duration > 6

// sundaycharge="25"
// mondaycharge="15"
// weekfactor="0.878857143"
// weekendfactor="1.1"
// minrentalperiod="2"
// satnavcharge="85"
// satnavperiod="7"
// satnavadditionalcharge="5"
// overseaslicencecharge="40"
// rideoutsideukcharge="100"
// C400="£1,500"
// C400GT="£1,500"
// C400X="£1,500"
// G310GS="£1,500"
// G310R="£1,500"
// F700GS="£1,500"
// F750GS="£1,500"
// F800GS="£1,500"
// F800GSAdventure="£1,500"
// F800GT="£1,500"
// F800R="£1,500"
// F850GS="£1,500"
// F850GSAdventure="£1,500"
// K1600GTLE="£2,500"
// K1600GrandAmerica="£2,500"
// R1250GS="£1,800"
// R1250GSAdventure="£1,800"
// R1200RS="£1,800"
// R1250RS="£1,800"
// R1250RT="£2,000"
// R1250R="£2,000"
// RnineTPure="£1,500"
// RnineTRacer="£1,500"
// RnineTScrambler="£1,500"
// RnineTSidecar="£2,500"
// RnineTUrbanGS="£1,500"
// RnineT="£1,500"
// S1000R="£2,000"
// S1000RR="£2,000"
// S1000XR="£1,800"


// constants 
// ------------------------------------
const weekFactor = 1; // 0.878857143;
const weekendFactor = 1; //1.1;
const minRental = 2;
const sundayCharge = (25).toFixed(2);
const mondayCharge = (15).toFixed(2);
const satnavCharge = (85).toFixed(2);
const satnavPeriod = 7
const satnavadditionalCharge = (5).toFixed(2);
const overseaslicenceCharge = (40).toFixed(2);
const rideoutsideukCharge = (100).toFixed(2);
const panniersCharge = (0).toFixed(2);
const topboxCharge = (0).toFixed(2);
const tankbagCharge = (0).toFixed(2);


// global
// ------------------------------------
const date = new Date();

const isWeekend = function() {
    if (rental.pickup_date.getDay() < 5) return false;
    if (rental.duration() > minRental) return false;
    return true;
}

const populate = function() {

    // bike
    rental.bike = $('#bike option:selected').text();
    rental.daily = $('#bike option:selected').val();
    $('#motorcycle').val(rental.bike);

    // daily rate
    $('#daily').val(`£${(parseInt(rental.daily,10)).toFixed(2)}`);

    // duration
    $('#days').val(rental.duration());

    // charge
    rental.charge = (rental.daily * rental.duration()).toFixed(2);
    $('#charge').val(`£${rental.charge}`);

    // weekend
    // if (isWeekend()) {
    //     // weekend = daily rate * 2 * 1.1
    //     const weekendRate = (parseInt(rental.daily,10) * 2 * 1.1);
    //     rental.weekend = Math.ceil(weekendRate - rental.charge).toFixed(2);
    //     $("#weekend_charge").val(`£${rental.weekend}`);
    //     $("#weekend_item").attr('hidden', false);
    // }
    // else {
        rental.weekend = 0;
        $("#weekend_charge").val(`£${rental.weekend}`);
        $("#weekend_item").attr('hidden', true);
    // }

    // pickup / dropoff charges
    if (rental.pickup_date.getDay() == 0) {
         rental.sundayPickup_charge = sundayCharge;
         $("#sundaypickup_charge").val(`£${rental.sundayPickup_charge}`);
         $("#sundaypickup_item").attr('hidden', false);
        } 
    else {
        rental.sundayPickup_charge = 0;
        $("#sundaypickup_charge").val(`£${rental.sundayPickup_charge}`);
        $("#sundaypickup_item").attr('hidden', true);
    } 

    if (rental.pickup_date.getDay() == 1) {
        rental.mondayPickup_charge = mondayCharge;
        $("#mondaypickup_charge").val(`£${rental.mondayPickup_charge}`);
        $("#mondaypickup_item").attr('hidden', false);
    } 
    else {
       rental.mondayPickup_charge = 0;
       $("#mondaypickup_charge").val(`£${rental.mondayPickup_charge}`);
       $("#mondaypickup_item").attr('hidden', true);
    } 

    if (rental.dropoff_date.getDay() == 0) {
        rental.sundayDropoff_charge = sundayCharge;
        $("#sundaydropoff_charge").val(`£${rental.sundayDropoff_charge}`);
        $("#sundaydropoff_item").attr('hidden', false);
    } 
    else {
       rental.sundayDropoff_charge = 0;
       $("#sundaydropoff_charge").val(`£${rental.sundayDropoff_charge}`);
       $("#sundaydropoff_item").attr('hidden', true);
    } 

    if (rental.dropoff_date.getDay() == 1) {
        rental.mondayDropoff_charge = mondayCharge;
        $("#mondaydropoff_charge").val(`£${rental.mondayDropoff_charge}`);
        $("#mondaydropoff_item").attr('hidden', false);
    } 
    else {
       rental.mondayDropoff_charge = 0;
       $("#mondaydropoff_charge").val(`£${rental.mondayDropoff_charge}`);
       $("#mondaydropoff_item").attr('hidden', true);
    } 

    // extras
    if ($('#satnav').is(':checked')) {
        rental.satnav_charge = (parseInt(satnavCharge,10)).toFixed(2);
        if (rental.duration() > satnavPeriod) {
            const additionalDays = rental.duration() - satnavPeriod;
            rental.satnav_charge = (parseInt(rental.satnav_charge,10) + parseInt(additionalDays,10) * parseInt(satnavadditionalCharge,10)).toFixed(2);
        }
        $("#satnav_charge").val(`£${rental.satnav_charge}`)
        $("#satnav_item").attr('hidden', false)

    }
    else {
        rental.satnav_charge = 0;
        $("#satnav_charge").val(`£${rental.satnav_charge}`)
        $("#satnav_item").attr('hidden', true);
    }

    if ($('#overseas').is(':checked')) {
        rental.overseas_charge = parseInt(overseaslicenceCharge,10).toFixed(2);
        $("#overseas_charge").val(`£${rental.overseas_charge}`)
        $("#overseas_item").attr('hidden', false);
    }
    else {
        rental.overseas_charge = 0;
        $("#overseas_charge").val(`£${rental.overseas_charge}`)
        $("#overseas_item").attr('hidden', true);
    }

    if ($('#outside').is(':checked')) {
        rental.outside_charge = parseInt(rideoutsideukCharge,10).toFixed(2);
        $("#outside_charge").val(`£${rental.outside_charge}`)
        $("#outside_item").attr('hidden', false);
    }
    else {
        rental.outside_charge = 0;
        $("#outside_charge").val(`£${rental.outside_charge}`)
        $("#outside_item").attr('hidden', true);
    }

    if ($('#panniers').is(':checked')) {
        rental.panniers_charge = parseInt(panniersCharge, 10).toFixed(2);
        $("#panniers_charge").val(`£${rental.panniers_charge}`)
        $("#panniers_item").attr('hidden', false);
    }
    else {
        rental.panniers_charge = 0;
        $("#panniers_charge").val(`£${rental.panniers_charge}`)
        $("#panniers_item").attr('hidden', true);
    }

    if ($('#topbox').is(':checked')) {
        rental.topbox_charge = parseInt(topboxCharge, 10).toFixed(2);
        $("#topbox_charge").val(`£${rental.topbox_charge}`)
        $("#topbox_item").attr('hidden', false);
    }
    else {
        rental.topbox_charge = 0;
        $("#topbox_charge").val(`£${rental.topbox_charge}`)
        $("#topbox_item").attr('hidden', true);
    }

    if ($('#tankbag').is(':checked')) {
        rental.tankbag_charge = parseInt(tankbagCharge, 10).toFixed(2);
        $("#tankbag_charge").val(`£${rental.tankbag_charge}`)
        $("#tankbag_item").attr('hidden', false);
    }
    else {
        rental.tankbag_charge = 0;
        $("#tankbag_charge").val(`£${rental.tankbag_charge}`)
        $("#tankbag_item").attr('hidden', true);
    }


    // discount
    // if (rental.duration() > 6) {
    //     const discount = (parseInt(rental.charge,10) * weekFactor);
    //     rental.discount = Math.ceil(discount - rental.charge).toFixed(2);
    //     $("#week_discount").val(`£${rental.discount}`);
    //     $("#discount_item").attr('hidden', false);
    // }
    // else {
        rental.week = 0;
        $("#week_discount").val(`£${rental.week}`);
        $("#discount_item").attr('hidden', true);
    // }

    rental.discount = 0;        // remove this if reinstating week / weekend / discounts...

    // total
    let total = parseInt(rental.charge, 10);
    total = total + parseInt(rental.weekend, 10);
    total = total + parseInt(rental.sundayPickup_charge, 10);
    total = total + parseInt(rental.sundayDropoff_charge, 10);
    total = total + parseInt(rental.mondayPickup_charge, 10);
    total = total + parseInt(rental.mondayDropoff_charge, 10);
    total = total + parseInt(rental.satnav_charge, 10);
    total = total + parseInt(rental.overseas_charge, 10);
    total = total + parseInt(rental.outside_charge, 10);

    total = total + parseInt(rental.discount, 10);
    // total = total + rental.overseas;

    $("#total").val(`£${total.toFixed(2)}`);

}

// initialise form 
// ------------------------------------
$('#pickup_date').datepicker({
    useCurrent: false,
    format: "dd M yyyy",
    startDate: '+2d',
    endDate: '+730d',
    maxViewMode: 2,
    multidate: false,
    autoclose: true,
    toggleActive: true,
    todayHighlight: true,
});

$('#dropoff_date').datepicker({
    format: "dd M yyyy",
    startDate: '+3d',
    endDate: '+737d',
    maxViewMode: 2,
    multidate: false,
    autoclose: true,
    // startView: '+14',
    toggleActive: true,
    todayHighlight: true
});


// rental object 
// ------------------------------------
let rental = {};

rental.date = function (dt, hh, mm) {
    d = new Date(dt);
    d.setHours(hh);
    d.setMinutes(mm);
    d.setSeconds(0);
    return d;
}

rental.bike = $('#bike option:first').text();
rental.daily = $('#bike option:first').val();
rental.weekly = function () {
    return Math.ceil(rental.daily * weekFactor * 100) / 100;
}
rental.pickup_date = $('#pickup_date').val();
rental.pickup_hours = $('#pickup_hours').find(":first").val();
rental.pickup_minutes = $('#pickup_minutes').find(":first").val();

// rental.dropoff_date = $('#dropoff_date').val();
rental.dropoff_hours = $('#dropoff_hours').find(":first").val();
rental.dropoff_minutes = $('#dropoff_minutes').find(":first").val();

// pickup date
rental.pickup_date = new Date(date.setDate(date.getDate() + 2));
rental.pickup_date.setHours(rental.pickup_hours);
rental.pickup_date.setMinutes(rental.pickup_minutes);
// rental.pickup = rental.date(rental.pickup_date, rental.pickup_hours, rental.pickup_minutes);
$('#pickup_date').datepicker('setDate', rental.pickup_date);

// dropoff date
rental.dropoff_date = new Date(date.setDate(date.getDate() + 7));
rental.dropoff_date.setHours(rental.dropoff_hours);
rental.dropoff_date.setMinutes(rental.dropoff_minutes);
// rental.dropoff = rental.date(rental.dropoff_date, rental.dropoff_hours, rental.dropoff_minutes);
$('#dropoff_date').datepicker('update', rental.dropoff_date);

rental.duration = function() {
    let duration = (rental.dropoff_date - rental.pickup_date) / 1000 / 60 / 60 / 24;
    duration = Math.ceil(duration.toFixed(3))
    duration = duration < minRental ? minRental : duration;
    return duration;
}


// initialise summary
populate();


// events
$('#pickup_date').change(function () {
    rental.pickup_date = $(this).val();
    rental.pickup_date = rental.date(rental.pickup_date, rental.pickup_hours, rental.pickup_minutes);

    let minDate = new Date(rental.pickup_date);
    minDate = minDate.setDate(minDate.getDate() + 1);

    $('#dropoff_date').datepicker('setStartDate', new Date(minDate.valueOf()));

    if (rental.pickup_date > rental.dropoff_date) {
        rental.dropoff_date = new Date(rental.pickup_date);
        rental.dropoff_date.setDate(rental.dropoff_date.getDate() + 7);
        rental.dropoff_date.setHours(rental.dropoff_hours);
        rental.dropoff_date.setMinutes(rental.dropoff_minutes);
        $('#dropoff_date').datepicker('update', rental.dropoff_date);
    }    
});

$('#pickup_hours').change(function () {
    rental.pickup_hours = $(this).val();
    rental.pickup_date = rental.date(rental.pickup_date, rental.pickup_hours, rental.pickup_minutes);
});

$('#pickup_minutes').change(function () {
    rental.pickup_minutes = $(this).val();
    rental.pickup_date = rental.date(rental.pickup_date, rental.pickup_hours, rental.pickup_minutes);
});

$('#dropoff_date').change(function (e) {
    rental.dropoff_date = $(this).val();
    rental.dropoff_date = rental.date(rental.dropoff_date, rental.dropoff_hours, rental.dropoff_minutes);
});

$('#dropoff_hours').change(function () {
    rental.dropoff_hours = $(this).val();
    rental.dropoff_date = rental.date(rental.dropoff_date, rental.dropoff_hours, rental.dropoff_minutes);
});

$('#dropoff_minutes').change(function () {
    rental.dropoff_minutes = $(this).val();
    rental.dropoff_date = rental.date(rental.dropoff_date, rental.dropoff_hours, rental.dropoff_minutes);
});


$('#calculator').change(function (){
    // console.log(`${new Date()}: form changed... `);
    populate();
    // console.dir(rental);
});




function onSubmit(token) {
    console.log('submitting...');
//   $("#calculator").submit();
}

