//初始化:
// 取得產品列表 -> 渲染產品列表
// 取得購物車列表 -> 存進購物車data -> 渲染購物車列表

// 事件綁定:
// 篩選change時: 篩選data.product.category -> 渲染產品列表
// click 加入購物車: (post, 預設數量1)(若購物車沒有此產品=>num=1，若有=> num+=1) -> 取得購物車列表  -> 渲染購物車列表
// 刪除購物車所有item
// 刪除購物車單一item

// click 送出訂單:
//  1. 驗證
//  2.取得購物車列表  -> 渲染購物車列表 (因為送出訂單後會清空)
//  3. 清空資料表

const productList = document.querySelector(".productWrap");
const getProductUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`;
const cartUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`;
const customerOrderUrl = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`;
let productData = [];
let cartData = [];
let cacheData = [];

//初始化
function innit() {
  getProductList();
  getCartList();
}
innit();

//取得產品列表 -> 渲染產品列表
function getProductList() {
  axios
    .get(getProductUrl)
    .then((res) => {
      console.log("productData:", res.data.products);
      productData = res.data.products;
      cacheData = productData;
      renderProductList();
    })
    .catch((err) => console.log(err));
}

function renderProductList() {
  let str = "";
  cacheData.forEach((item) => {
    str += `<li class="productCard">
              <h4 class="productType">新品</h4>
              <img
                src="${item.images}"
                alt="圖片-${item.title}"
              />
              <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
              <h3>${item.title}</h3>
              <del class="originPrice">${toThousands(item.origin_price)}</del>
              <p class="nowPrice">${toThousands(item.price)}</p>
          </li>`;
  });
  productList.innerHTML = str;
}

// 取得購物車列表 -> 存進購物車data -> 渲染購物車列表
function getCartList() {
  axios.get(cartUrl).then((res) => {
    cartData = res.data.carts;
    console.log("cartData:", res.data.carts);
    // cartData = res.data.carts;
    renderCartList();
  });
}

const shoppingCartList = document.querySelector(".shoppingCartList");
const totalAmt = document.querySelector(".totalAmt");

function renderCartList() {
  let str = "";
  let strTotalAmt = 0;
  cartData.forEach((item) => {
    let total = item.product.price * item.quantity;
    str += `<tr>
              <td>
                <div class="cardItem-title">
                  <img src="image/HvT3zlU.png" alt="" />
                  <p>${item.product.title}</p>
                </div>
              </td>
              <td>${toThousands(item.product.price)}</td>
              <td>${item.quantity}</td>
              <td>${toThousands(total)}</td>
              <td class="discardBtn">
                <a href="#" class="material-icons" data-cartId="${
                  item.id
                }"> clear </a>
              </td>
            </tr>`;

    strTotalAmt += total;
  });
  totalAmt.textContent = `NT$${toThousands(strTotalAmt)}`;
  shoppingCartList.innerHTML = str;
}

//篩選類型
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", (e) => {
  selectedType = e.target.value;
  if (selectedType == "全部") {
    cacheData = productData;
  } else {
    cacheData = productData.filter((item) => item.category == selectedType);
  }
  renderProductList();
});

//加入購物車
productList.addEventListener("click", (e) => {
  let productId;
  let productNum = 1;
  if (e.target.getAttribute("class") == "addCardBtn") {
    e.preventDefault(); //避免重整
    productId = e.target.dataset.id;
    // console.log("tsettt:", cartData);

    cartData.forEach((item) => {
      if (productId == item.product.id) {
        //如果所點選的id=購物車裡的id，num+1 (代表購物車裡面已經有了)
        productNum = item.quantity += 1;
      }
    });
  }
  axios
    .post(cartUrl, {
      data: {
        productId: productId,
        quantity: productNum,
      },
    })
    .then((res) => {
      getCartList();
    })
    .catch((err) => console.log(err));
});

//刪除購物車所有品項
const deleteAllCartBtn = document.querySelector(".discardAllBtn");
deleteAllCartBtn.addEventListener("click", (e) => {
  e.preventDefault();
  axios
    .delete(cartUrl)
    .then((res) => {
      getCartList();
      alert("成功刪除購物車所有品項!");
    })
    .catch((err) => alert("購物車已清空，請勿重複點擊!"));
});

//刪除購物車單一品項
shoppingCartList.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.hasAttribute("data-cartid")) {
    var cartId = e.target.dataset.cartid;
  }
  cartData.forEach((item) => {
    if (cartId == item.id) {
      axios
        .delete(
          `https://livejs-api.hexschool.io/api/livejs/v1/customer/yashienxzxz/carts/${cartId}`
        )
        .then((res) => {
          getCartList();
          alert(`成功刪除<${item.product.title}>`);
        })
        .catch((err) => console.log(err));
    }
  });
});

const submitBtn = document.querySelector(".js-submit-btn");
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const customerName = document.querySelector("#customerName");
  const customerPhone = document.querySelector("#customerPhone");
  const customerEmail = document.querySelector("#customerEmail");
  const customerAddress = document.querySelector("#customerAddress");
  const tradeWay = document.querySelector("#tradeWay");
  const orderForm = document.querySelector(".orderInfo-form");

  if (
    customerName.value == "" ||
    customerPhone.value == "" ||
    customerEmail.value == "" ||
    customerAddress.value == "" ||
    tradeWay.vallue
  ) {
    alert("請完整填寫資料!");
  } else {
    axios
      .post(customerOrderUrl, {
        data: {
          user: {
            name: customerName.value,
            tel: customerPhone.value,
            email: customerEmail.value,
            address: customerAddress.value,
            payment: tradeWay.value,
          },
        },
      })
      .then((res) => {
        getCartList();
      })
      .catch((err) => console.log(err));

    alert("確認送出訂單!");
    orderForm.reset();
  }
});

//金額轉千分位
function toThousands(num) {
  return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
}
