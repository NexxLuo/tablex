function autoNext() {
  setInterval(function() {
    let mainDocument = document.getElementsByTagName("iframe")[1]
      .contentDocument;

    let frames = mainDocument.getElementsByTagName("frameset")[1].children;
    let leftFrame = frames[0].contentDocument;
    let rightFrame = frames[1].contentDocument;

    let remarkText = rightFrame.getElementById("tdRemark").innerText;
    let nextButton = leftFrame.getElementById("btnNext");

    let bl = remarkText.indexOf("已经学习完毕") > -1;

    //console.log("auto next:", bl, remarkText);

    if (bl === true) {
      console.log("auto next waiting...");

      nextButton.click();

      console.log("auto next done...");
    }
  }, 5000);
}


