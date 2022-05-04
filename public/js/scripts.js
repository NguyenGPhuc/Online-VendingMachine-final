$(document).ready(function(){
  $("#googleFormButton").on("click", showForm);
  $("#googleForm").hide();
  function showForm() {
    if($("#googleFormButton").html() == "Want Us to Add Something New to Our Vending Machine?") {
        $("#googleFormButton").html("Close Form");
    } else {
       $("#googleFormButton").html("Want Us to Add Something New to Our Vending Machine?");
    }
    $("#googleForm").toggle();
    //alert($("#googleFormButton").html());
  }
  var keyword = '';

  $("select").change(function(){
      $(this).find("option:selected").each(function(){
          var optionValue = $(this).attr("value");
          if(optionValue){
              $(".selected").not("." + optionValue).hide();
              $("." + optionValue).show();
          } else{
              $(".selected").hide();
          }
      });
  }).change();


  $('input[type="radio"]').click(function(){
    var inputValue = $(this).attr("value");
		displayPicture(inputValue - 1); //subtracting 1 since arrays start at zero
    var targetBox = $("."+inputValue);
    console.log(inputValue);
    $(".box").not(targetBox).hide();
    $(targetBox).show();

    friesTopping();
    pizzaTopping();
    burgerTopping();
    nuggetTopping();
  });

	// $("#fries").on("click", displayPicture());
	// $('input[type="radio"]').on("click", displayPicture());

  async function displayPicture(itemNumber) {
		let allFoodItems = ["french fries", "pizza", "hamburger", "sprite soda can", "dr.pepper", "ice cream", "chocolate ice cream", "chicken nuggets", "coca-cola","strawberry ice cream", "twix", "kit kat", "water bottle", "skittles", "potato chips"];

		//Getting the corresponding value
		keyword = allFoodItems[itemNumber];
		// alert("Keyword:: " + keyword);


    let url = `https://pixabay.com/api/?key=23607448-b061c74e68f39c7a343becb19&q=${keyword}&image_type=photo`;
    let data = await fetchData(url);

    let imageURL = data.hits[0].webformatURL;
    // alert(imageURL);
    
    $("#foodPic").html(`<img src="${imageURL}" id="foodImg">`);
    // $("#foodPic").html("updated");
    
    // alert("done running displayPicture function");
  }


  async function friesTopping(){
    
    friesTopping = function(){};
    let fryChoice = ["Bacon", "Cheese", "Truffle"];

    // keyword = "fries";
    // displayPicture();

    $("#topingFry").html("Choose your toppings");
    for (let i = 0; i < fryChoice.length; i++) {
      $("#friesTop").append(`<input type="checkbox" name="fry" id="${fryChoice[i]}" value = "${fryChoice[i]}"> <lable for="${fryChoice[i]}"> ${fryChoice[i]} </lable>`)
    }

  }

  function nuggetTopping(){
    nuggetTopping = function(){};

    let nuggetChoice = ["Bacon", "Cheese"]

    $("#topingNugget").html("Choose your toppings");
    for (let i = 0; i < nuggetChoice.length; i++) {
      $("#nuggetTop").append(`<input type="checkbox" name="nugs" id="${nuggetChoice[i]}" value = "${nuggetChoice[i]}"> <lable for="${nuggetChoice[i]}"> ${nuggetChoice[i]} </lable>`)
    }
  }

  function pizzaTopping(){
    pizzaTopping = function(){};

    let pizzaChoice = ["Pepperoni", "Ham", "Sausage", "Chicken", "Mushroom", "Olives", "Pineapple"]

    $("#topingPizza").html("Choose your toppings");
    for (let i = 0; i < pizzaChoice.length; i++) {
      $("#pizzaTop").append(`<input type="checkbox" name="piz" id="${pizzaChoice[i]}" value = "${pizzaChoice[i]}"> <lable for="${pizzaChoice[i]}"> ${pizzaChoice[i]} </lable>`)
    }
  }


  function burgerTopping(){
    burgerTopping = function(){};

    let burgerChoice = ["Bacon", "Lettuce", "Tomato", "Pickles", "Mushroom", "Cheese"]

    $("#topingBurger").html("Choose your toppings");
    for (let i = 0; i < burgerChoice.length; i++) {
      $("#burgerTop").append(`<input type="checkbox" name="piz" id="${burgerChoice[i]}" value = "${burgerChoice[i]}"> <lable for="${burgerChoice[i]}"> ${burgerChoice[i]} </lable>`)
    }
  }

	$("#cart").on("click", displayCart);
  $("#cartDelete").on("click", deleteCart);
  $("#clearCart").on("click", clearCart);

  $("#cart .close").click();
  $("#cart .close").trigger("click"); 

	async function displayCart(){
    closeModal();

		$("#customerName").html("");
		$("#cartContents").html("");
		$("#subtotal").html("<h5><strong>Empty Cart</strong></h5>");
		$("#total").html("");
    $("#tax").html("");
		var myModal = new bootstrap.Modal (document.getElementById("cartModal"));

    
		myModal.show();
  
    
		let customerId = $(this).attr("id");
		// alert("Clicked");

		let url = `/api/cartInfo?customerId=${customerId}`;
		let response = await fetch(url);
		let data = await response.json();

		console.log(data.length);

		$("#customerName").html(`<u><strong>${data[0].firstName} ${data[0].lastName} <strong></u>`);

		// $("#cartContents").html(data[0].foodId);
		let subtotal = 0;
		for(let i = 0; i < data.length; i++){
      $("#cartContents").append(`<strong>Item ${i + 1}:</strong> ${data[i].title}: $ ${data[i].price.toFixed(2)} <br>`);
			subtotal += data[i].price;
		}
    // $("#cartContents").hide();
		$("#subtotal").html(`<strong>Subtotal:</strong> $${(subtotal).toFixed(2)}`);
    $("#tax").html("<strong>Tax:</strong> 10%");
		$("#total").html(`<strong>Total:</strong> $${(subtotal * 1.1).toFixed(2)}`);
	}


  async function deleteCart(){
    $("#thankU").show();
    emptyCart();
    $("#thankU").html(`<h1>Thank you for choosing Runtime Terror's Fancy Vending Machine!</h1>`);
  }

  async function clearCart(){
    emptyCart();

    $("#empty").html(`<h1>Cart has been cleared</h1>`);
  }


  async function emptyCart(){
    closeModal();

    $("#thankU").html("");
    $("#customerName").html("");
		$("#cartContents").html("");
		$("#subtotal").html("");
		$("#total").html("");
		$("#tax").html("");
    $("#thankU").html("");
    $("#empty").html("");

    var myModal = new bootstrap.Modal (document.getElementById("cartModal"));

    
    myModal.show();

    
    let customerId = $(this).attr("id");
    // alert("Clicked");

    let url = `/api/cartDelete?customerId=${customerId}`;
    let response = await fetch(url);
    let data = await response.json();
  }
  

  async function fetchData(url){
		let response = await fetch(url);
		let data = await response.json();
		// console.log(data);
		return data;
	}

  async function closeModal(){
    $('.modal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
  }

});