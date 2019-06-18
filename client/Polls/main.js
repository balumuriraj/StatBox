function createPoll() {
  const messageElm = document.getElementById("message");
  const title = document.getElementById("title").value;
  const type = document.getElementById("type").value;
  const filter = document.getElementById("filter").value;

  if (title) {
    axios.post("/api/rest/admin/createPoll", { title, type, filter }).then((result) => {
      console.log("Poll created.. Database id#", result.data);
      messageElm.innerText = "Poll created.. Poll id: " + result.data;
    }).catch((err) => {
      console.log(err);
      messageElm.innerText = "Poll creation failed..";
    });
  }
}
