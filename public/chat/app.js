
const messages = [
    {"role": "system", "content": "You are a computer answering questions."},
];

async function sendChat() {
    const prompt = document.querySelector("#prompt").value;
    document.querySelector("#prompt").value = "";
    document.querySelector("ul").innerHTML += `<li><b>${prompt}</b></li>`

   

    document.querySelector("#prompt").value = "";
    document.querySelector("input").focus();
}