const input = document.querySelector("input");
const button = document.querySelector("button");


function GeneratePassword(length = 16) {

    const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$/*&%";
    let password = "";
    for (let i = 0; i < length; ++i) {
        let at = Math.floor(Math.random() * (charset.length + 1));
        password += charset.charAt(at);
    }
    return password;
}
button.addEventListener("click", () => {
    input.value = GeneratePassword(16);
});
