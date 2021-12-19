const orderList = document.querySelector(".orderList");
const adminOrderUrl = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`;

function init() {
  getOrderList();
}
init();

let allOrderList;
function getOrderList() {
  axios
    .get(adminOrderUrl, {
      headers: {
        authorization: token,
      },
    })
    .then((res) => {
      allOrderList = res.data.orders;
      renderOrderList();
      c3Chart();
    })
    .catch((err) => console.log(err));
}

function renderOrderList() {
  let str = "";
  allOrderList.forEach((item) => {
    //組產品字串
    let productStr = "";
    item.products.forEach((perProduct) => {
      productStr += `<p class='whiteSpace'>${perProduct.title} x ${perProduct.quantity}</p>`;
    });

    //組時間字串
    let timeStamp = new Date(item.createdAt * 1000);
    let createOrderTime = `${timeStamp.getFullYear()}/${
      timeStamp.getMonth() + 1
    }/${timeStamp.getDate()}`;

    //組付款字串
    let orderStatus;
    if (item.paid == false) {
      orderStatus = "未處理";
    } else if (item.paid == true) {
      orderStatus = "已處理";
    }

    str += `<tr>
          <td>${item.id}</td>
          <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
          </td>
          <td>${item.user.address}</td>
          <td>${item.user.email}</td>
          <td>
            <p>${productStr}</p>
          </td>
          <td>${createOrderTime}</td>
          <td class="orderStatus">
            <a href="#" class='whiteSpace'>${orderStatus}</a>
          </td>
          <td>
            <input type="button" class="delSingleOrder-Btn" value="刪除" data-orderId="${item.id}"/>
          </td>
        </tr>`;
  });
  orderList.innerHTML = str;
}

// C3d 圖表
function c3Chart() {
  let obj = {};
  let sumUpData;

  allOrderList.forEach((perOrder) => {
    perOrder.products.forEach((perItem) => {
      if (obj[perItem.title] == undefined) {
        obj[perItem.title] = perItem.price * perItem.quantity;
      } else {
        obj[perItem.title] += perItem.price * perItem.quantity;
      }
      sumUpData = Object.entries(obj);
    });
  });

  //排序 => 篩選出前三名
  sumUpData.sort((a, b) => {
    return b[1] - a[1];
  });

  let others;
  if (sumUpData.length > 3) {
    others = sumUpData.splice(3, sumUpData.length - 3);
  }

  let sum = 0;
  others.forEach((item) => {
    sum += item[1];
  });
  sumUpData.push(["其他", sum]);

  let chart = c3.generate({
    bindto: "#chart",
    data: {
      type: "pie",
      columns: sumUpData,
    },
  });
}

//刪除單一訂單
orderList.addEventListener("click", (e) => {
  // console.log(e.target);
  if (e.target.hasAttribute("data-orderid")) {
    axios
      .delete(
        `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${e.target.dataset.orderid}`,
        {
          headers: {
            authorization: token,
          },
        }
      )
      .then(() => {
        getOrderList();
        alert("成功刪除此筆訂單!");
      })
      .catch((err) => console.log(err));
  }
});

//刪除所有訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  axios
    .delete(adminOrderUrl, {
      headers: {
        authorization: token,
      },
    })
    .then(() => {
      alert("成功刪除所有訂單!");
      getOrderList();
    })
    .catch((err) => console.log(err));
});
