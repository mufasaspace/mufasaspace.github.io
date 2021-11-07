// @ts-check

/**
 * getting the input by the <input> tag
 */
const input = document.querySelector("input");
/**
 * getting the button by the <button> tag
 */
const button = document.querySelector("button");

/**
 * Generate a Random String as Password
 * @param {Number} [length] length of the generated password
 * @return {String} generated string with random charachters (password)
 */
function GeneratePassword(length = 16) {
  /**
   * These characters are used to generate the password
   * @type {String}
   */
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";

  /**
   * Generated Characters as String
   * @type {String}
   */
  let password = "";

  /**
   * Running the for loop x times
   * x = length
   *
   * using ++ in front of i to increase the i value
   * before the block gets executed
   *
   * so i is strting with 1 instead of 0 because otherwise
   * the first character would be always a (0)
   */
  for (let i = 0; i < length; ++i) {
    /**
     * Generating a random number
     * between 0 and the charset length to get
     * a random character from the whole string
     * @type {Number}
     */
    let at = Math.floor(Math.random() * (charset.length + 1));

    /**
     * Getting a random char from the charset
     * and append it to the password variable
     */
    password += charset.charAt(at);
  }

  /**
   * returning the password
   */
  return password;
}

/**
 * Generate a random password on button click
 * and set it as value of the input
 */
button.addEventListener("click", () => {
  input.value = GeneratePassword(16);
});
