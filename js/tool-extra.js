/* =========================================================
   TOOLSPHERE EXTRA TOOLS
   URL Encoder / Decoder, UUID Generator, JWT Decoder
   Everything runs in the browser. Nothing is uploaded.
   Loaded after script.js, only on the pages that need it.
========================================================= */

(function () {

    "use strict";


    /* ---------- Shared helpers ---------- */

    function byId(id) {
        return document.getElementById(id);
    }


    function showMessage(element, text, isError) {

        if (!element) {
            return;
        }

        element.textContent = text;
        element.classList.toggle("is-error", Boolean(isError));
    }


    function copyText(text, button, messageElement) {

        if (!text) {
            showMessage(messageElement, "There is nothing to copy yet.", true);
            return;
        }

        function done() {

            const original = button.getAttribute("data-label") || button.textContent;

            button.setAttribute("data-label", original);
            button.textContent = "Copied!";

            setTimeout(function () {
                button.textContent = original;
            }, 1500);
        }

        function fallback() {

            const helper = document.createElement("textarea");

            helper.value = text;
            helper.setAttribute("readonly", "");
            helper.style.position = "fixed";
            helper.style.opacity = "0";

            document.body.appendChild(helper);
            helper.select();

            try {
                document.execCommand("copy");
                done();
            } catch (error) {
                showMessage(messageElement, "Copy failed. Select the text and copy it yourself.", true);
            }

            helper.remove();
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, fallback);
        } else {
            fallback();
        }
    }


    /* =====================================================
       1. URL ENCODER / DECODER
    ===================================================== */

    const urlInput = byId("urlInput");

    if (urlInput) {

        const urlOutput = byId("urlOutput");
        const urlMessage = byId("urlMessage");

        byId("encodeUrlPartButton").addEventListener("click", function () {

            if (!urlInput.value) {
                urlOutput.value = "";
                showMessage(urlMessage, "Enter some text to encode.", true);
                return;
            }

            urlOutput.value = encodeURIComponent(urlInput.value);
            showMessage(urlMessage, "Encoded as a URL part.", false);
        });

        byId("encodeUrlFullButton").addEventListener("click", function () {

            if (!urlInput.value) {
                urlOutput.value = "";
                showMessage(urlMessage, "Enter a web address to encode.", true);
                return;
            }

            try {
                urlOutput.value = encodeURI(urlInput.value);
                showMessage(urlMessage, "Encoded as a full web address.", false);
            } catch (error) {
                urlOutput.value = "";
                showMessage(urlMessage, "That text contains a broken character and cannot be encoded.", true);
            }
        });

        byId("decodeUrlButton").addEventListener("click", function () {

            if (!urlInput.value) {
                urlOutput.value = "";
                showMessage(urlMessage, "Enter some encoded text to decode.", true);
                return;
            }

            try {
                /* A plus sign in a form query means a space */
                urlOutput.value = decodeURIComponent(
                    urlInput.value.replace(/\+/g, " ")
                );
                showMessage(urlMessage, "Decoded successfully.", false);
            } catch (error) {
                urlOutput.value = "";
                showMessage(urlMessage, "This is not valid URL-encoded text. Check for a stray % sign.", true);
            }
        });

        byId("clearUrlButton").addEventListener("click", function () {
            urlInput.value = "";
            urlOutput.value = "";
            showMessage(urlMessage, "", false);
            urlInput.focus();
        });

        byId("copyUrlButton").addEventListener("click", function () {
            copyText(urlOutput.value, this, urlMessage);
        });
    }


    /* =====================================================
       2. UUID GENERATOR (version 4)
    ===================================================== */

    const uuidCount = byId("uuidCount");

    function makeUuid() {

        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }

        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);

        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        const hex = Array.from(bytes, function (b) {
            return b.toString(16).padStart(2, "0");
        }).join("");

        return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" +
               hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" +
               hex.slice(20);
    }

    if (uuidCount) {

        const uuidOutput = byId("uuidOutput");
        const uuidMessage = byId("uuidMessage");
        const uuidUpper = byId("uuidUpper");
        const uuidNoHyphens = byId("uuidNoHyphens");

        function generateUuids() {

            let count = parseInt(uuidCount.value, 10);

            if (isNaN(count) || count < 1 || count > 100) {
                showMessage(uuidMessage, "Choose a number from 1 to 100.", true);
                return;
            }

            const list = [];

            for (let i = 0; i < count; i++) {

                let value = makeUuid();

                if (uuidNoHyphens.checked) {
                    value = value.replace(/-/g, "");
                }

                if (uuidUpper.checked) {
                    value = value.toUpperCase();
                }

                list.push(value);
            }

            uuidOutput.value = list.join("\n");

            showMessage(
                uuidMessage,
                count === 1 ? "Generated 1 UUID." : "Generated " + count + " UUIDs.",
                false
            );
        }

        byId("generateUuidButton").addEventListener("click", generateUuids);

        byId("copyUuidButton").addEventListener("click", function () {
            copyText(uuidOutput.value, this, uuidMessage);
        });

        generateUuids();
    }


    /* =====================================================
       3. JWT DECODER
    ===================================================== */

    const jwtInput = byId("jwtInput");

    function base64UrlToText(part) {

        let value = part.replace(/-/g, "+").replace(/_/g, "/");

        while (value.length % 4 !== 0) {
            value += "=";
        }

        const binary = atob(value);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    }

    function describeTime(seconds) {

        const date = new Date(seconds * 1000);

        if (isNaN(date.getTime())) {
            return "not a valid time";
        }

        return date.toUTCString();
    }

    if (jwtInput) {

        const jwtHeader = byId("jwtHeader");
        const jwtPayload = byId("jwtPayload");
        const jwtSignature = byId("jwtSignature");
        const jwtTimes = byId("jwtTimes");
        const jwtMessage = byId("jwtMessage");

        function clearJwtOutput() {
            jwtHeader.value = "";
            jwtPayload.value = "";
            jwtSignature.value = "";
            jwtTimes.textContent = "";
        }

        byId("decodeJwtButton").addEventListener("click", function () {

            clearJwtOutput();

            let token = jwtInput.value.trim().replace(/\s+/g, "");

            if (/^bearer/i.test(token)) {
                token = token.slice(6);
            }

            if (!token) {
                showMessage(jwtMessage, "Paste a token to decode.", true);
                return;
            }

            const parts = token.split(".");

            if (parts.length !== 3) {
                showMessage(
                    jwtMessage,
                    "A JWT has three parts separated by dots. This text has " + parts.length + ".",
                    true
                );
                return;
            }

            let header;
            let payload;

            try {
                header = JSON.parse(base64UrlToText(parts[0]));
                payload = JSON.parse(base64UrlToText(parts[1]));
            } catch (error) {
                showMessage(jwtMessage, "This does not look like a valid JWT. The first two parts could not be read.", true);
                return;
            }

            jwtHeader.value = JSON.stringify(header, null, 2);
            jwtPayload.value = JSON.stringify(payload, null, 2);
            jwtSignature.value = parts[2] || "(empty: this token is unsigned)";

            const lines = [];
            const now = Math.floor(Date.now() / 1000);

            if (typeof payload.iat === "number") {
                lines.push("Issued at (iat): " + describeTime(payload.iat));
            }

            if (typeof payload.nbf === "number") {
                lines.push("Not valid before (nbf): " + describeTime(payload.nbf));
            }

            if (typeof payload.exp === "number") {
                lines.push(
                    "Expires (exp): " + describeTime(payload.exp) +
                    (payload.exp < now ? " (EXPIRED)" : " (not expired yet)")
                );
            }

            if (header && header.alg === "none") {
                lines.push("Warning: alg is \"none\", so this token has no signature at all.");
            }

            jwtTimes.textContent = lines.join("\n");

            showMessage(jwtMessage, "Decoded. The signature has NOT been checked.", false);
        });

        byId("clearJwtButton").addEventListener("click", function () {
            jwtInput.value = "";
            clearJwtOutput();
            showMessage(jwtMessage, "", false);
            jwtInput.focus();
        });

        byId("copyJwtPayloadButton").addEventListener("click", function () {
            copyText(jwtPayload.value, this, jwtMessage);
        });
    }


    /* =====================================================
       4. UNIX TIMESTAMP CONVERTER
    ===================================================== */

    const tsInput = byId("tsInput");

    if (tsInput) {

        const tsMessage = byId("tsMessage");
        const fields = {
            utc: byId("tsUtc"),
            local: byId("tsLocal"),
            iso: byId("tsIso"),
            relative: byId("tsRelative")
        };

        function clearTsFields() {
            Object.keys(fields).forEach(function (key) {
                fields[key].value = "";
            });
        }

        function describeRelative(ms) {

            const diff = ms - Date.now();
            const abs = Math.abs(diff);

            const units = [
                ["year", 365 * 24 * 3600 * 1000],
                ["month", 30 * 24 * 3600 * 1000],
                ["day", 24 * 3600 * 1000],
                ["hour", 3600 * 1000],
                ["minute", 60 * 1000],
                ["second", 1000]
            ];

            for (let i = 0; i < units.length; i++) {

                if (abs >= units[i][1] || i === units.length - 1) {

                    const n = Math.floor(abs / units[i][1]);
                    const label = n + " " + units[i][0] + (n === 1 ? "" : "s");

                    return diff < 0 ? label + " ago" : "in " + label;
                }
            }
        }

        function showTimestamp(ms) {

            const date = new Date(ms);

            if (isNaN(date.getTime())) {
                clearTsFields();
                showMessage(tsMessage, "That number is outside the range of dates a browser can show.", true);
                return false;
            }

            const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "local time";

            fields.utc.value = date.toUTCString();
            fields.local.value = date.toLocaleString() + " (" + zone + ")";
            fields.iso.value = date.toISOString();
            fields.relative.value = describeRelative(ms);

            return true;
        }

        byId("tsConvertButton").addEventListener("click", function () {

            const raw = tsInput.value.trim();

            if (!/^-?\d+(\.\d+)?$/.test(raw)) {
                clearTsFields();
                showMessage(tsMessage, "Enter a number, such as 1700000000.", true);
                return;
            }

            const number = Number(raw);

            /* Numbers this large are milliseconds, not seconds */
            const isMs = Math.abs(number) >= 100000000000;

            if (!showTimestamp(isMs ? number : number * 1000)) {
                return;
            }

            showMessage(
                tsMessage,
                isMs ? "Read as milliseconds." : "Read as seconds.",
                false
            );
        });

        byId("tsNowButton").addEventListener("click", function () {
            tsInput.value = String(Math.floor(Date.now() / 1000));
            byId("tsConvertButton").click();
        });

        byId("dateConvertButton").addEventListener("click", function () {

            const value = byId("dateInput").value;

            if (!value) {
                byId("dateSeconds").value = "";
                byId("dateMillis").value = "";
                showMessage(tsMessage, "Pick a date and time first.", true);
                return;
            }

            const ms = new Date(value).getTime();

            byId("dateSeconds").value = String(Math.floor(ms / 1000));
            byId("dateMillis").value = String(ms);

            showMessage(tsMessage, "Converted using your local time zone.", false);
        });

        byId("copyTsButton").addEventListener("click", function () {
            copyText(fields.iso.value, this, tsMessage);
        });
    }


    /* =====================================================
       5. REGEX TESTER
       Runs in a background worker, so a bad pattern that
       takes too long is stopped instead of freezing the page.
    ===================================================== */

    const rxPattern = byId("rxPattern");

    if (rxPattern) {

        const rxText = byId("rxText");
        const rxOutput = byId("rxOutput");
        const rxMessage = byId("rxMessage");

        const workerSource =
            "onmessage=function(e){var d=e.data;try{" +
            "var re=new RegExp(d.pattern,d.flags);var out=[];var m;" +
            "while((m=re.exec(d.text))!==null&&out.length<500){" +
            "out.push({i:m.index,t:m[0],g:Array.prototype.slice.call(m,1)});" +
            "if(m[0]===''){re.lastIndex++;}}" +
            "postMessage({ok:true,matches:out});" +
            "}catch(err){postMessage({ok:false,error:String(err.message||err)});}};";

        let worker = null;
        let timer = null;

        function stopWorker() {

            if (worker) {
                worker.terminate();
                worker = null;
            }

            clearTimeout(timer);
        }

        function runRegex() {

            stopWorker();

            if (!rxPattern.value) {
                rxOutput.value = "";
                showMessage(rxMessage, "Enter a pattern to test.", true);
                return;
            }

            let flags = "";

            ["i", "m", "s", "u"].forEach(function (flag) {
                if (byId("rxFlag" + flag).checked) {
                    flags += flag;
                }
            });

            const wantAll = byId("rxFlagg").checked;

            /* Always search globally inside the worker, then trim */
            flags += "g";

            try {
                worker = new Worker(
                    URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }))
                );
            } catch (error) {
                showMessage(rxMessage, "This browser could not start the tester.", true);
                return;
            }

            showMessage(rxMessage, "Testing...", false);

            timer = setTimeout(function () {
                stopWorker();
                rxOutput.value = "";
                showMessage(
                    rxMessage,
                    "Stopped after 2 seconds. This pattern is too slow on this text (it may backtrack too much).",
                    true
                );
            }, 2000);

            worker.onmessage = function (event) {

                const result = event.data;

                stopWorker();

                if (!result.ok) {
                    rxOutput.value = "";
                    showMessage(rxMessage, "Invalid pattern: " + result.error, true);
                    return;
                }

                let matches = result.matches;

                if (!wantAll) {
                    matches = matches.slice(0, 1);
                }

                if (matches.length === 0) {
                    rxOutput.value = "";
                    showMessage(rxMessage, "No matches.", false);
                    return;
                }

                const lines = [];

                matches.forEach(function (match, index) {

                    lines.push(
                        "Match " + (index + 1) + " at position " + match.i + ": " +
                        JSON.stringify(match.t)
                    );

                    match.g.forEach(function (group, groupIndex) {
                        lines.push(
                            "    Group " + (groupIndex + 1) + ": " +
                            (group === undefined ? "(did not take part)" : JSON.stringify(group))
                        );
                    });
                });

                rxOutput.value = lines.join("\n");

                showMessage(
                    rxMessage,
                    matches.length === 1 ? "1 match." :
                        matches.length + " matches" + (result.matches.length >= 500 ? " (showing the first 500)." : "."),
                    false
                );
            };

            worker.onerror = function () {
                stopWorker();
                rxOutput.value = "";
                showMessage(rxMessage, "The pattern could not be run.", true);
            };

            worker.postMessage({
                pattern: rxPattern.value,
                flags: flags,
                text: rxText.value
            });
        }

        byId("rxRunButton").addEventListener("click", runRegex);

        byId("rxClearButton").addEventListener("click", function () {
            stopWorker();
            rxPattern.value = "";
            rxText.value = "";
            rxOutput.value = "";
            showMessage(rxMessage, "", false);
            rxPattern.focus();
        });

        byId("copyRxButton").addEventListener("click", function () {
            copyText(rxOutput.value, this, rxMessage);
        });
    }


    /* =====================================================
       6. COLOR CONVERTER
    ===================================================== */

    const colorInput = byId("colorInput");

    if (colorInput) {

        const colorMessage = byId("colorMessage");
        const colorSwatch = byId("colorSwatch");
        const colorPicker = byId("colorPicker");

        function toHex(n) {
            return n.toString(16).padStart(2, "0");
        }

        function luminance(r, g, b) {

            const parts = [r, g, b].map(function (value) {
                const c = value / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });

            return 0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2];
        }

        function contrast(l1, l2) {
            const hi = Math.max(l1, l2);
            const lo = Math.min(l1, l2);
            return (hi + 0.05) / (lo + 0.05);
        }

        function rating(ratio) {

            if (ratio >= 7) {
                return "passes AAA";
            }

            if (ratio >= 4.5) {
                return "passes AA";
            }

            if (ratio >= 3) {
                return "large text only";
            }

            return "fails";
        }

        function rgbToHsl(r, g, b) {

            r /= 255; g /= 255; b /= 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const d = max - min;

            let h = 0;
            let s = 0;
            const l = (max + min) / 2;

            if (d !== 0) {

                s = d / (1 - Math.abs(2 * l - 1));

                if (max === r) {
                    h = ((g - b) / d) % 6;
                } else if (max === g) {
                    h = (b - r) / d + 2;
                } else {
                    h = (r - g) / d + 4;
                }

                h *= 60;

                if (h < 0) {
                    h += 360;
                }
            }

            return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
        }

        function convertColor() {

            const value = colorInput.value.trim();

            if (!value) {
                showMessage(colorMessage, "Enter a color, such as #2563eb or rgb(37, 99, 235).", true);
                return;
            }

            /* Let the browser understand the color, then read it back */
            const probe = document.createElement("div");

            probe.style.color = value;

            if (probe.style.color === "") {
                showMessage(colorMessage, "That is not a color the browser understands.", true);
                return;
            }

            document.body.appendChild(probe);
            const computed = getComputedStyle(probe).color;
            probe.remove();

            const numbers = computed.match(/[\d.]+/g);

            if (!numbers || numbers.length < 3) {
                showMessage(colorMessage, "That color could not be read.", true);
                return;
            }

            const r = Math.round(Number(numbers[0]));
            const g = Math.round(Number(numbers[1]));
            const b = Math.round(Number(numbers[2]));
            const hsl = rgbToHsl(r, g, b);
            const hex = "#" + toHex(r) + toHex(g) + toHex(b);

            byId("colorHex").value = hex;
            byId("colorRgb").value = "rgb(" + r + ", " + g + ", " + b + ")";
            byId("colorHsl").value = "hsl(" + hsl[0] + ", " + hsl[1] + "%, " + hsl[2] + "%)";

            colorSwatch.style.background = hex;
            colorPicker.value = hex;

            const lum = luminance(r, g, b);
            const white = contrast(lum, 1);
            const black = contrast(lum, 0);

            byId("colorContrast").textContent =
                "Contrast with white text: " + white.toFixed(2) + ":1 (" + rating(white) + ")\n" +
                "Contrast with black text: " + black.toFixed(2) + ":1 (" + rating(black) + ")";

            const alpha = numbers.length > 3 ? Number(numbers[3]) : 1;

            showMessage(
                colorMessage,
                alpha < 1 ? "Converted. Transparency (alpha) is ignored here." : "Converted.",
                false
            );
        }

        byId("convertColorButton").addEventListener("click", convertColor);

        colorInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                convertColor();
            }
        });

        colorPicker.addEventListener("input", function () {
            colorInput.value = colorPicker.value;
            convertColor();
        });

        ["Hex", "Rgb", "Hsl"].forEach(function (name) {
            byId("copyColor" + name + "Button").addEventListener("click", function () {
                copyText(byId("color" + name).value, this, colorMessage);
            });
        });

        convertColor();
    }


    /* =====================================================
       7. CONTACT FORM
       Sends the form to Netlify Forms without leaving the page.
    ===================================================== */

    const contactForm = byId("contactForm");

    if (contactForm) {

        const contactStatus = byId("contactStatus");
        const contactSubmit = byId("contactSubmit");

        /* Used when the browser sent the form the plain way */
        if (window.location.search.indexOf("sent=1") !== -1) {
            showMessage(contactStatus, "Thank you! Your message has been sent. We will reply by email.", false);
        }

        contactForm.addEventListener("submit", function (event) {

            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            contactSubmit.disabled = true;
            showMessage(contactStatus, "Sending...", false);

            const body = new URLSearchParams(new FormData(contactForm)).toString();

            fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body
            }).then(function (response) {

                if (!response.ok) {
                    throw new Error("Not sent");
                }

                contactForm.reset();

                showMessage(
                    contactStatus,
                    "Thank you! Your message has been sent. We will reply by email.",
                    false
                );

            }).catch(function () {

                showMessage(
                    contactStatus,
                    "Sorry, the message could not be sent. Please email toolsphere.contact@gmail.com instead.",
                    true
                );

            }).then(function () {
                contactSubmit.disabled = false;
            });
        });
    }

})();