
// initialise form 
// ------------------------------------
$('#dob').datepicker({
    useCurrent: false,
    format: "dd M yyyy",
    startDate: '-80y',
    endDate: '-24y',
    maxViewMode: 2,
    multidate: false,
    autoclose: true,
    toggleActive: true,
    todayHighlight: true,
});

$('#dob').datepicker('update', new Date());


var urlParams = new URLSearchParams(window.location.search);

const debug = urlParams.get('debug');

if (debug == 'mw') {

    $('#name').val("Martin Williamson");
    $('#subject').val("Testing");
    $('#message').val("testing testing...");
    $('#firstname').val("Martin");
    $('#lastname').val("Williamson");
    $('#dob').val("25/10/1967");
    $('#email').val("martinwi@me.com");
    $('#phone').val("0131 654 2777");
    $('#home_address_1').val("226 High Street");
    $('#home_city').val("Dalkeith");
    $('#home_country').val("Scotland");
    $('#home_postcode').val("EH22 1AZ");
    $('#contactdetails').val("2 Street");
    $('#occupation').val("Tester");
    $('#licence').val("1234");
    $('#authority').val("DVLA");
    $('#licenceaddress').val("3 Street");
    $('#emergencycontactname').val("Fred");
    $('#emergencycontactnumber').val("01234");
    $('#emergencycontactrelationship').val("Pal");

    $('#rentaltermsagreement').prop('checked', true);
    $('#insurancetermsagreement').prop('checked', true);
    $('#excess').prop('checked', true);

}