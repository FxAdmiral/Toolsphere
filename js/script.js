/* =========================================================
   TOOLSPHERE - MAIN JAVASCRIPT
   Password Generator
   Password Strength Checker
   Hash Generator
========================================================= */


/* =========================================================
   1. PASSWORD GENERATOR
========================================================= */

const passwordOutput = document.getElementById("password");
const copyButton = document.getElementById("copyButton");
const generateButton = document.getElementById("generateButton");

const passwordLength = document.getElementById("passwordLength");
const lengthValue = document.getElementById("lengthValue");

const uppercaseCheckbox = document.getElementById("uppercase");
const lowercaseCheckbox = document.getElementById("lowercase");
const numbersCheckbox = document.getElementById("numbers");
const symbolsCheckbox = document.getElementById("symbols");


/* Cryptographically secure random number (no modulo bias) */

function getSecureRandomIndex(max) {

    const limit =
        Math.floor(4294967296 / max) * max;

    const array = new Uint32Array(1);

    do {
        crypto.getRandomValues(array);
    } while (array[0] >= limit);

    return array[0] % max;
}


function generatePassword() {

    if (!passwordOutput) {
        return;
    }

    const length = Number(passwordLength.value);

    const uppercase =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const lowercase =
        "abcdefghijklmnopqrstuvwxyz";

    const numbers =
        "0123456789";

    const symbols =
        "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let characters = "";
    let password = "";

    if (uppercaseCheckbox.checked) {
        characters += uppercase;
    }

    if (lowercaseCheckbox.checked) {
        characters += lowercase;
    }

    if (numbersCheckbox.checked) {
        characters += numbers;
    }

    if (symbolsCheckbox.checked) {
        characters += symbols;
    }

    if (!characters) {
        passwordOutput.value = "";
        passwordOutput.placeholder =
            "Select at least one character type.";
        return;
    }

    for (let i = 0; i < length; i++) {

        const randomIndex =
            getSecureRandomIndex(characters.length);

        password += characters[randomIndex];
    }

    passwordOutput.value = password;
}


if (passwordLength && lengthValue) {

    passwordLength.addEventListener(
        "input",
        function () {

            lengthValue.textContent =
                passwordLength.value;

        }
    );
}


if (generateButton) {

    generateButton.addEventListener(
        "click",
        generatePassword
    );
}


if (copyButton) {

    copyButton.addEventListener(
        "click",
        function () {

            if (!passwordOutput.value) {
                return;
            }

            navigator.clipboard
                .writeText(passwordOutput.value)
                .then(function () {

                    copyButton.textContent =
                        "Copied!";

                    setTimeout(function () {

                        copyButton.textContent =
                            "Copy";

                    }, 2000);

                })
                .catch(function () {

                    alert(
                        "Unable to copy password."
                    );

                });

        }
    );
}


/* =========================================================
   2. PASSWORD STRENGTH CHECKER
========================================================= */

const strengthPassword =
    document.getElementById("strengthPassword");

const togglePassword =
    document.getElementById("togglePassword");

const strengthText =
    document.getElementById("strengthText");

const strengthBar =
    document.getElementById("strengthBar");

const feedbackList =
    document.getElementById("feedbackList");


if (strengthPassword) {


    /* -----------------------------------------------------
       SHOW / HIDE PASSWORD
    ----------------------------------------------------- */

    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            function () {

                if (
                    strengthPassword.type ===
                    "password"
                ) {

                    strengthPassword.type =
                        "text";

                    togglePassword.textContent =
                        "Hide";

                } else {

                    strengthPassword.type =
                        "password";

                    togglePassword.textContent =
                        "Show";
                }

            }
        );
    }


    /* -----------------------------------------------------
       PASSWORD STRENGTH CHECK
    ----------------------------------------------------- */

    /* -----------------------------------------------------
       HELPERS
    ----------------------------------------------------- */

    const keyboardRows = [
        "qwertyuiop",
        "asdfghjkl",
        "zxcvbnm",
        "1234567890"
    ];

    const commonWords = [
        "password",
        "passw0rd",
        "qwerty",
        "admin",
        "letmein",
        "welcome",
        "iloveyou",
        "login",
        "monkey",
        "dragon",
        "football",
        "123456"
    ];

    function hasSequence(text) {

        const lower = text.toLowerCase();

        for (let i = 0; i < lower.length - 2; i++) {

            const a = lower.charCodeAt(i);
            const b = lower.charCodeAt(i + 1);
            const c = lower.charCodeAt(i + 2);

            if (
                (b === a + 1 && c === b + 1) ||
                (b === a - 1 && c === b - 1)
            ) {
                return true;
            }

            const part = lower.slice(i, i + 3);
            const reversed = part.split("").reverse().join("");

            for (const row of keyboardRows) {
                if (
                    row.includes(part) ||
                    row.includes(reversed)
                ) {
                    return true;
                }
            }
        }

        return false;
    }


    function setLevel(level) {

        const levels = [
            "level-weak",
            "level-fair",
            "level-strong",
            "level-very-strong"
        ];

        [strengthText, strengthBar].forEach(
            function (element) {

                if (!element) {
                    return;
                }

                element.classList.remove(...levels);

                if (level) {
                    element.classList.add(level);
                }
            }
        );
    }


    function showFeedback(messages) {

        if (!feedbackList) {
            return;
        }

        feedbackList.textContent = "";

        messages.forEach(
            function (message) {

                const li =
                    document.createElement("li");

                li.textContent = message;

                feedbackList.appendChild(li);
            }
        );
    }


    /* -----------------------------------------------------
       PASSWORD STRENGTH CHECK
    ----------------------------------------------------- */

    function checkPasswordStrength() {

        const password =
            strengthPassword.value;

        /* Empty state */

        if (!password) {

            setLevel("");

            if (strengthText) {
                strengthText.textContent = "—";
            }

            if (strengthBar) {
                strengthBar.style.width = "0%";
            }

            showFeedback([
                "Enter a password to check its strength."
            ]);

            return;
        }


        let score = 0;
        const feedback = [];


        /* Length */

        if (password.length >= 8) {
            score++;
        }

        if (password.length >= 12) {
            score++;
        }

        if (password.length >= 16) {
            score++;
        }

        if (password.length < 8) {
            feedback.push(
                "Use at least 8 characters. 12 or more is better."
            );
        } else if (password.length < 12) {
            feedback.push(
                "Make it 12 or more characters for better protection."
            );
        } else if (password.length < 16) {
            feedback.push(
                "16 or more characters gives even stronger protection."
            );
        }


        /* Character types */

        if (/[a-z]/.test(password)) {
            score++;
        } else {
            feedback.push("Add lowercase letters.");
        }

        if (/[A-Z]/.test(password)) {
            score++;
        } else {
            feedback.push("Add uppercase letters.");
        }

        if (/[0-9]/.test(password)) {
            score++;
        } else {
            feedback.push("Add numbers.");
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            score++;
        } else {
            feedback.push("Add special characters.");
        }


        /* Weak patterns */

        if (/(.)\1\1/.test(password)) {

            score--;

            feedback.push(
                "Avoid repeating the same character three or more times."
            );
        }

        if (hasSequence(password)) {

            score--;

            feedback.push(
                "Avoid easy sequences such as abc, 123 or qwerty."
            );
        }

        const lower = password.toLowerCase();

        const containsCommonWord =
            commonWords.some(
                function (word) {
                    return lower.includes(word);
                }
            );

        if (containsCommonWord) {

            score = Math.min(score, 2);

            feedback.push(
                "Avoid common words and passwords, even with extra characters."
            );
        }

        if (score < 0) {
            score = 0;
        }


        /* Strength level */

        let strength;
        let percentage;
        let level;

        if (score <= 2) {

            strength = "Weak";
            percentage = 25;
            level = "level-weak";

        } else if (score <= 4) {

            strength = "Fair";
            percentage = 50;
            level = "level-fair";

        } else if (score <= 6) {

            strength = "Strong";
            percentage = 75;
            level = "level-strong";

        } else {

            strength = "Very Strong";
            percentage = 100;
            level = "level-very-strong";
        }


        if (strengthText) {
            strengthText.textContent = strength;
        }

        if (strengthBar) {
            strengthBar.style.width = percentage + "%";
        }

        setLevel(level);


        /* Feedback */

        if (feedback.length === 0) {

            feedback.push(
                "This password meets common strength guidelines."
            );
        }

        feedback.push(
            "Use a different password for every account. This checker is only a guide and cannot guarantee a password is safe."
        );

        showFeedback(feedback);
    }


    strengthPassword.addEventListener(
        "input",
        checkPasswordStrength
    );
}


/* =========================================================
   3. HASH GENERATOR
========================================================= */

const hashInput =
    document.getElementById("hashInput");

const hashAlgorithm =
    document.getElementById("hashAlgorithm");

const generateHashButton =
    document.getElementById("generateHashButton");

const clearHashButton =
    document.getElementById("clearHashButton");

const copyHashButton =
    document.getElementById("copyHashButton");

const hashOutput =
    document.getElementById("hashOutput");


/* ---------------------------------------------------------
   HASH GENERATION FUNCTION
--------------------------------------------------------- */

async function generateHash() {

    if (
        !hashInput ||
        !hashAlgorithm ||
        !hashOutput
    ) {
        return;
    }


    const text =
        hashInput.value;


    if (!text) {

        hashOutput.value = "";

        hashOutput.placeholder =
            "Enter text first to generate a hash.";

        return;
    }


    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(text);


    try {

        const hashBuffer =
            await crypto.subtle.digest(
                hashAlgorithm.value,
                data
            );


        const hashArray =
            Array.from(
                new Uint8Array(hashBuffer)
            );


        const hashHex =
            hashArray
                .map(
                    function (byte) {

                        return byte
                            .toString(16)
                            .padStart(2, "0");

                    }
                )
                .join("");


        hashOutput.value =
            hashHex;

        hashOutput.placeholder =
            "Your generated hash will appear here...";


    } catch (error) {

        console.error(
            "Hash generation error:",
            error
        );


        hashOutput.value = "";

        hashOutput.placeholder =
            "Unable to generate hash.";
    }
}


/* ---------------------------------------------------------
   GENERATE HASH BUTTON
--------------------------------------------------------- */

if (generateHashButton) {

    generateHashButton.addEventListener(
        "click",
        generateHash
    );
}


/* ---------------------------------------------------------
   COPY HASH
--------------------------------------------------------- */

if (copyHashButton) {

    copyHashButton.addEventListener(
        "click",
        function () {

            if (
                !hashOutput ||
                !hashOutput.value
            ) {
                return;
            }


            navigator.clipboard
                .writeText(
                    hashOutput.value
                )
                .then(function () {

                    copyHashButton.textContent =
                        "Copied!";


                    setTimeout(
                        function () {

                            copyHashButton.textContent =
                                "Copy";

                        },
                        2000
                    );

                })
                .catch(function () {

                    alert(
                        "Unable to copy hash."
                    );

                });

        }
    );
}


/* ---------------------------------------------------------
   CLEAR HASH GENERATOR
--------------------------------------------------------- */

if (clearHashButton) {

    clearHashButton.addEventListener(
        "click",
        function () {

            if (hashInput) {
                hashInput.value = "";
            }

            if (hashOutput) {

                hashOutput.value = "";

                hashOutput.placeholder =
                    "Your generated hash will appear here...";
            }

        }
    );
}


/* =========================================================
   4. BASE64 ENCODER / DECODER
========================================================= */

const base64Input =
    document.getElementById("base64Input");

const base64Output =
    document.getElementById("base64Output");

const encodeBase64Button =
    document.getElementById("encodeBase64Button");

const decodeBase64Button =
    document.getElementById("decodeBase64Button");

const clearBase64Button =
    document.getElementById("clearBase64Button");

const copyBase64Button =
    document.getElementById("copyBase64Button");

const base64Message =
    document.getElementById("base64Message");


function showBase64Message(text, isError) {

    if (!base64Message) {
        return;
    }

    base64Message.textContent = text;

    base64Message.classList.toggle(
        "is-error",
        Boolean(isError)
    );
}


function encodeBase64() {

    if (!base64Input || !base64Output) {
        return;
    }

    const text = base64Input.value;

    if (!text) {
        base64Output.value = "";
        showBase64Message(
            "Enter some text to encode.",
            true
        );
        return;
    }

    /* Text -> UTF-8 bytes -> binary string -> Base64 */

    const bytes = new TextEncoder().encode(text);

    let binary = "";

    bytes.forEach(function (byte) {
        binary += String.fromCharCode(byte);
    });

    base64Output.value = btoa(binary);

    showBase64Message("Encoded successfully.", false);
}


function decodeBase64() {

    if (!base64Input || !base64Output) {
        return;
    }

    /* Ignore spaces and line breaks; accept URL-safe characters */

    let value = base64Input.value
        .replace(/\s+/g, "")
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    if (!value) {
        base64Output.value = "";
        showBase64Message(
            "Enter some Base64 to decode.",
            true
        );
        return;
    }

    while (value.length % 4 !== 0) {
        value += "=";
    }

    try {

        const binary = atob(value);

        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        base64Output.value =
            new TextDecoder("utf-8", { fatal: true })
                .decode(bytes);

        showBase64Message("Decoded successfully.", false);

    } catch (error) {

        base64Output.value = "";

        if (error instanceof TypeError) {

            showBase64Message(
                "The data decoded, but it is not readable text. It may be a file or image.",
                true
            );

        } else {

            showBase64Message(
                "That is not valid Base64. Check for missing or extra characters.",
                true
            );
        }
    }
}


if (encodeBase64Button) {
    encodeBase64Button.addEventListener(
        "click",
        encodeBase64
    );
}

if (decodeBase64Button) {
    decodeBase64Button.addEventListener(
        "click",
        decodeBase64
    );
}

if (clearBase64Button) {

    clearBase64Button.addEventListener(
        "click",
        function () {

            if (base64Input) {
                base64Input.value = "";
            }

            if (base64Output) {
                base64Output.value = "";
            }

            showBase64Message("", false);
        }
    );
}

if (copyBase64Button) {

    copyBase64Button.addEventListener(
        "click",
        function () {

            if (!base64Output || !base64Output.value) {
                showBase64Message(
                    "There is nothing to copy yet.",
                    true
                );
                return;
            }

            if (!navigator.clipboard) {
                showBase64Message(
                    "Copying is not available here. Select the result and copy it manually.",
                    true
                );
                return;
            }

            navigator.clipboard
                .writeText(base64Output.value)
                .then(function () {

                    copyBase64Button.textContent = "Copied!";

                    setTimeout(function () {
                        copyBase64Button.textContent = "Copy";
                    }, 2000);

                })
                .catch(function () {

                    showBase64Message(
                        "Unable to copy. Select the result and copy it manually.",
                        true
                    );
                });
        }
    );
}


/* =========================================================
   JSON FORMATTER AND VALIDATOR
========================================================= */

const jsonInput =
    document.getElementById("jsonInput");

const jsonOutput =
    document.getElementById("jsonOutput");

const jsonIndent =
    document.getElementById("jsonIndent");

const jsonMessage =
    document.getElementById("jsonMessage");

const jsonErrorContext =
    document.getElementById("jsonErrorContext");

const formatJsonButton =
    document.getElementById("formatJsonButton");

const minifyJsonButton =
    document.getElementById("minifyJsonButton");

const validateJsonButton =
    document.getElementById("validateJsonButton");

const exampleJsonButton =
    document.getElementById("exampleJsonButton");

const clearJsonButton =
    document.getElementById("clearJsonButton");

const copyJsonButton =
    document.getElementById("copyJsonButton");


function showJsonMessage(text, kind) {

    if (!jsonMessage) {
        return;
    }

    jsonMessage.textContent = text;

    jsonMessage.classList.toggle(
        "is-error",
        kind === "error"
    );

    jsonMessage.classList.toggle(
        "is-warning",
        kind === "warning"
    );

    if (jsonErrorContext) {
        jsonErrorContext.hidden = true;
        jsonErrorContext.textContent = "";
    }
}


/* Replace the inside of every "double quoted string" with x
   characters, keeping the same length, so we can look for
   structure without being fooled by text inside strings. */

function maskJsonStrings(text) {

    let result = "";
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {

        const ch = text[i];

        if (inString) {

            if (escaped) {
                escaped = false;
                result += "x";
            } else if (ch === "\\") {
                escaped = true;
                result += "x";
            } else if (ch === '"') {
                inString = false;
                result += '"';
            } else {
                result += (ch === "\n") ? "\n" : "x";
            }

        } else {

            if (ch === '"') {
                inString = true;
            }

            result += ch;
        }
    }

    return result;
}


function positionToLineColumn(text, position) {

    const before = text.slice(0, position);
    const lines = before.split("\n");

    return {
        line: lines.length,
        column: lines[lines.length - 1].length + 1
    };
}


function findJsonProblem(text) {

    const masked = maskJsonStrings(text);

    let match = /,\s*[}\]]/.exec(masked);

    if (match) {
        return {
            index: match.index,
            hint: "There is an extra comma before a closing bracket. JSON does not allow a comma after the last item."
        };
    }

    match = /\/\/|\/\*/.exec(masked);

    if (match) {
        return {
            index: match.index,
            hint: "JSON does not allow comments. Remove them."
        };
    }

    match = /'/.exec(masked);

    if (match) {
        return {
            index: match.index,
            hint: "JSON needs double quotes (\"), not single quotes (')."
        };
    }

    match = /[{,]\s*([A-Za-z_$][\w$]*)\s*:/.exec(masked);

    if (match) {
        return {
            index: match.index + match[0].indexOf(match[1]),
            hint: "Keys must be in double quotes, for example \"name\": \"Ada\"."
        };
    }

    match = /\b(undefined|NaN|Infinity)\b/.exec(masked);

    if (match) {
        return {
            index: match.index,
            hint: match[1] + " is not valid in JSON. Use null or a number instead."
        };
    }

    return null;
}


function showJsonError(text, error) {

    const message = String(error && error.message || error);

    let line = null;
    let column = null;

    let match = message.match(/line (\d+) column (\d+)/i);

    if (match) {

        line = Number(match[1]);
        column = Number(match[2]);

    } else {

        match = message.match(/position (\d+)/i);

        if (match) {

            const where =
                positionToLineColumn(text, Number(match[1]));

            line = where.line;
            column = where.column;
        }
    }

    const problem = findJsonProblem(text);

    if (problem) {

        const where =
            positionToLineColumn(text, problem.index);

        line = where.line;
        column = where.column;
    }

    let summary = "This is not valid JSON.";

    if (line !== null) {
        summary += " The problem is near line " +
            line + ", column " + column + ".";
    }

    if (problem) {
        summary += " " + problem.hint;
    } else {
        summary += " Browser message: " + message;
    }

    showJsonMessage(summary, "error");

    if (jsonErrorContext && line !== null) {

        const lineText =
            text.split("\n")[line - 1] || "";

        let shown = lineText;
        let offset = column - 1;

        if (shown.length > 80) {

            const startAt = Math.max(0, offset - 40);

            shown = shown.slice(startAt, startAt + 80);
            offset = offset - startAt;
        }

        jsonErrorContext.textContent =
            shown + "\n" +
            " ".repeat(Math.max(0, offset)) + "^";

        jsonErrorContext.hidden = false;
    }
}


function parseJsonInput() {

    if (!jsonInput || !jsonOutput) {
        return null;
    }

    const text = jsonInput.value;

    if (!text.trim()) {

        jsonOutput.value = "";

        showJsonMessage(
            "Paste or type some JSON first.",
            "error"
        );

        return null;
    }

    try {

        return { value: JSON.parse(text), text: text };

    } catch (error) {

        jsonOutput.value = "";

        showJsonError(text, error);

        return null;
    }
}


function bigNumberWarning(text) {

    const masked = maskJsonStrings(text);

    const numbers =
        masked.match(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g) || [];

    const tooLong = numbers.some(
        function (number) {

            const mantissa =
                number.split(/[eE]/)[0]
                    .replace("-", "")
                    .replace(".", "")
                    .replace(/^0+/, "");

            return mantissa.length > 15;
        }
    );

    if (tooLong) {

        return " Warning: this JSON has a number with more than 15 " +
            "digits. Long numbers can be rounded, so check them.";
    }

    return "";
}


function jsonIndentValue() {

    const choice = jsonIndent ? jsonIndent.value : "2";

    if (choice === "tab") {
        return "\t";
    }

    return Number(choice);
}


if (formatJsonButton) {

    formatJsonButton.addEventListener(
        "click",
        function () {

            const parsed = parseJsonInput();

            if (!parsed) {
                return;
            }

            jsonOutput.value =
                JSON.stringify(
                    parsed.value,
                    null,
                    jsonIndentValue()
                );

            const warning = bigNumberWarning(parsed.text);

            showJsonMessage(
                "Valid JSON. Formatted." + warning,
                warning ? "warning" : "ok"
            );
        }
    );
}


if (minifyJsonButton) {

    minifyJsonButton.addEventListener(
        "click",
        function () {

            const parsed = parseJsonInput();

            if (!parsed) {
                return;
            }

            jsonOutput.value =
                JSON.stringify(parsed.value);

            const warning = bigNumberWarning(parsed.text);

            showJsonMessage(
                "Valid JSON. Minified." + warning,
                warning ? "warning" : "ok"
            );
        }
    );
}


if (validateJsonButton) {

    validateJsonButton.addEventListener(
        "click",
        function () {

            const parsed = parseJsonInput();

            if (!parsed) {
                return;
            }

            const warning = bigNumberWarning(parsed.text);

            showJsonMessage(
                "Valid JSON." + warning,
                warning ? "warning" : "ok"
            );
        }
    );
}


if (exampleJsonButton) {

    exampleJsonButton.addEventListener(
        "click",
        function () {

            if (jsonInput) {

                jsonInput.value =
                    '{"name":"Ada","age":25,"skills":["HTML","CSS"],"active":true,"address":null}';
            }

            if (jsonOutput) {
                jsonOutput.value = "";
            }

            showJsonMessage(
                "Example loaded. Click Format, Minify or Validate.",
                "ok"
            );
        }
    );
}


if (clearJsonButton) {

    clearJsonButton.addEventListener(
        "click",
        function () {

            if (jsonInput) {
                jsonInput.value = "";
            }

            if (jsonOutput) {
                jsonOutput.value = "";
            }

            showJsonMessage("", "ok");
        }
    );
}


const openJsonButton =
    document.getElementById("openJsonButton");

const jsonFile =
    document.getElementById("jsonFile");

const downloadJsonButton =
    document.getElementById("downloadJsonButton");


if (openJsonButton && jsonFile && jsonInput) {

    openJsonButton.addEventListener(
        "click",
        function () {
            jsonFile.click();
        }
    );

    jsonFile.addEventListener(
        "change",
        function () {

            const file = jsonFile.files[0];

            if (!file) {
                return;
            }

            if (file.size > 5 * 1024 * 1024) {

                showJsonMessage(
                    "That file is larger than 5 MB. Please choose a smaller file.",
                    "error"
                );

                jsonFile.value = "";
                return;
            }

            const reader = new FileReader();

            reader.onload = function () {

                jsonInput.value = String(reader.result);

                if (jsonOutput) {
                    jsonOutput.value = "";
                }

                showJsonMessage(
                    "Loaded " + file.name + " in your browser. " +
                    "Nothing was uploaded. Now click Format, Minify or Validate.",
                    "ok"
                );

                jsonFile.value = "";
            };

            reader.onerror = function () {

                showJsonMessage(
                    "Could not read that file.",
                    "error"
                );
            };

            reader.readAsText(file);
        }
    );
}


if (downloadJsonButton) {

    downloadJsonButton.addEventListener(
        "click",
        function () {

            if (!jsonOutput || !jsonOutput.value) {

                showJsonMessage(
                    "There is nothing to download yet.",
                    "error"
                );

                return;
            }

            const blob = new Blob(
                [jsonOutput.value],
                { type: "application/json" }
            );

            const link = document.createElement("a");

            link.href = URL.createObjectURL(blob);
            link.download = "result.json";

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(link.href);
        }
    );
}


if (copyJsonButton) {

    copyJsonButton.addEventListener(
        "click",
        function () {

            if (!jsonOutput || !jsonOutput.value) {

                showJsonMessage(
                    "There is nothing to copy yet.",
                    "error"
                );

                return;
            }

            if (!navigator.clipboard) {

                showJsonMessage(
                    "Copying is not available here. Select the result and copy it manually.",
                    "error"
                );

                return;
            }

            navigator.clipboard
                .writeText(jsonOutput.value)
                .then(function () {

                    copyJsonButton.textContent = "Copied!";

                    setTimeout(function () {
                        copyJsonButton.textContent = "Copy";
                    }, 2000);

                })
                .catch(function () {

                    showJsonMessage(
                        "Unable to copy. Select the result and copy it manually.",
                        "error"
                    );
                });
        }
    );
}


/* =========================================================
   5. MOBILE MENU
========================================================= */

const menuButton =
    document.querySelector(".menu-button");

const navigation =
    document.querySelector(".navigation");

if (menuButton && navigation) {

    function setMenu(open) {

        navigation.classList.toggle("open", open);

        menuButton.setAttribute(
            "aria-expanded",
            String(open)
        );

        menuButton.setAttribute(
            "aria-label",
            open ? "Close menu" : "Open menu"
        );

        menuButton.textContent =
            open ? "✕" : "☰";
    }

    menuButton.addEventListener(
        "click",
        function () {
            setMenu(
                !navigation.classList.contains("open")
            );
        }
    );

    navigation.querySelectorAll("a").forEach(
        function (link) {
            link.addEventListener(
                "click",
                function () {
                    setMenu(false);
                }
            );
        }
    );
}


/* =========================================================
   6. TABS (Guide / Videos)
========================================================= */

const tabButtons =
    document.querySelectorAll('[role="tab"]');

if (tabButtons.length > 0) {

    function showTab(name, updateAddress) {

        tabButtons.forEach(
            function (tab) {

                const selected =
                    tab.dataset.tab === name;

                tab.classList.toggle("active", selected);

                tab.setAttribute(
                    "aria-selected",
                    String(selected)
                );

                tab.setAttribute(
                    "tabindex",
                    selected ? "0" : "-1"
                );

                const panel =
                    document.getElementById(
                        tab.getAttribute("aria-controls")
                    );

                if (panel) {
                    panel.hidden = !selected;
                }
            }
        );

        if (updateAddress && window.history.replaceState) {

            window.history.replaceState(
                null,
                "",
                name === "videos"
                    ? "#videos"
                    : window.location.pathname
            );
        }
    }


    tabButtons.forEach(
        function (tab, index) {

            tab.addEventListener(
                "click",
                function () {
                    showTab(tab.dataset.tab, true);
                }
            );

            tab.addEventListener(
                "keydown",
                function (event) {

                    let target = null;

                    if (event.key === "ArrowRight") {
                        target =
                            tabButtons[
                                (index + 1) % tabButtons.length
                            ];
                    }

                    if (event.key === "ArrowLeft") {
                        target =
                            tabButtons[
                                (index - 1 + tabButtons.length) %
                                tabButtons.length
                            ];
                    }

                    if (target) {
                        event.preventDefault();
                        showTab(target.dataset.tab, true);
                        target.focus();
                    }
                }
            );
        }
    );


    document
        .querySelectorAll("[data-tab-link]")
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {
                        showTab(link.dataset.tabLink, true);
                        window.scrollTo(0, 0);
                    }
                );
            }
        );


    if (window.location.hash === "#videos") {
        showTab("videos", false);
    }
}


/* =========================================================
   END OF TOOLSPHERE JAVASCRIPT
========================================================= */