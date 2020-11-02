let input = document.querySelector('.use-keyboard-input');

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = new SpeechRecognition();
rec.interimResults = true;
rec.continuous = true;

let keyPress = light => {
    light.animate( [
        { color: 'white', background: 'black' },
        // { color: 'white', background: 'black' },
        { color: 'white', background: 'black' }
    ], {
        duration: 250
    })
}
const Keyboard = {
    speech (event) {
        const text = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
        if  (event.results[0].isFinal) {
            input.value = text;
        }
    },
    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    },

    properties: {
        value: "",
        capsLock: false,
        shift: false,
        buffer: '',
        start: 0,
        end: 0,
        direction: 'none',
        language: true,
        sound: false,
        record: false
    },

    init() {
        // Create main elements
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        // Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        // Automatically use keyboard for elements with .use-keyboard-input
        document.querySelectorAll(".use-keyboard-input").forEach(element => {

            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });

            element.addEventListener('click', () => {
                // Cursor
                this.properties.direction = 'none';
                this.properties.start = input.selectionStart;
                this.properties.end = input.selectionEnd;
            });
            element.addEventListener('keypress', key => {
                if (key.which === 13) keyPress(document.querySelector('.enter'));
                if (key.which === 32) keyPress(document.querySelector('.space'));
                // TODO: another func keys


                for (let light of this.elements.keys) {
                    if (key.key.toLowerCase() === light.textContent.toLowerCase()) keyPress(light);
                }
                // Physical keyboard input
                this.properties.value += key.key;
                this.open(element.value, currentValue => {
                    if (this.properties.start > element.value.length) {
                        element.value += currentValue.substring(currentValue.length - 1, currentValue.length)
                    } else {
                        element.value = element.value.substring(0, this.properties.start - 1)
                            + currentValue.substring(this.properties.start - 1, this.properties.end)
                            + element.value.substring(this.properties.end - 1, element.value.length);
                    }
                });
                this.properties.start++;
                this.properties.end++;
            });
            element.addEventListener('keydown', key => {
                if (key.which === 37) {
                    this.properties.start--;
                    this.properties.end--;
                    if (this.properties.start < 0) this.properties.start = 0;
                    if (this.properties.end < 0) this.properties.end = 0;
                }
                if (key.which === 39) {
                    this.properties.start++;
                    this.properties.end++;
                    if (this.properties.start > this.properties.value.length) this.properties.start = this.properties.value.length;
                    if (this.properties.end > this.properties.value.length) this.properties.end = this.properties.value.length;
                }

            })
        });
    },

    _createKeys() {
        const fragment = document.createDocumentFragment();
        const keyLayoutEn = [
            ["`", "~"], ["1", "!"], ["2", "@"], ["3", "#"], ["4", "$"], ["5", "%"], ["6", "^"], ["7", "&"], ["8", "*"], ["9", "("], ["0", ")"], ["-", "_"], ["=", "+"], "backspace",
            "tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", ["[", "{"], ["]", "}"], ["\\", "|"],
            "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", [";", ":"], ["'", "\""], "enter",
            "shift", "z", "x", "c", "v", "b", "n", "m", [",", "<"], [".", ">"], ["/", "?"],
            "done", "en", "space", "mic", "sound",  "left", "right"
        ];
        const keyLayoutRu = [
            "ё", ["1", "!"], ["2", "\""], ["3", "№"], ["4", ";"], ["5", "%"], ["6", ":"], ["7", "?"], ["8", "*"], ["9", "("], ["0", ")"], ["-", "_"], ["=", "+"], "backspace",
            "tab", "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ", ["\\", "|"],
            "caps", "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э", "enter",
            "shift", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", [".", ","],
            "done", "ru", "space", "mic", "sound",  "left", "right"
        ];

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        };

        let keyLayout;
        // check keys language
        if (this.properties.language) keyLayout = keyLayoutEn;
        else keyLayout = keyLayoutRu;
        // check for shift
        if (this.properties.shift)
            for (let i = 0; i < keyLayout.length; i++)
                if (typeof keyLayout[i] !== 'string')
                    keyLayout[i].reverse();

        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");

            // Add attributes/classes
            keyElement.setAttribute("type", "button");
            keyElement.classList.add("keyboard__key");

            switch (key) {
                case "en":
                    keyElement.innerHTML = "en";
                    keyElement.addEventListener('click', () => {
                        if (this.properties.sound) {
                            window.speechSynthesis.speak(new SpeechSynthesisUtterance('русский'));
                        }
                        if (this.properties.record) {
                            document.querySelector('.mic').classList.toggle('keyboard__key_mic');
                            rec = new SpeechRecognition();
                            rec.interimResults = true;
                            rec.continuous = true;
                            rec.lang = "ru-RU";
                            rec.addEventListener("result", this.speech);
                            rec.start();
                        }
                        this.properties.language = !this.properties.language;
                        while (this.elements.keysContainer.children.length > 0) this.elements.keysContainer.children[0].remove();
                        this.elements.keysContainer.appendChild(this._createKeys());
                        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");
                    });
                    break

                case "ru":
                    keyElement.innerHTML = "ru";
                    keyElement.addEventListener('click', () => {
                        if (this.properties.sound) {
                            window.speechSynthesis.speak(new SpeechSynthesisUtterance('english'));
                        }
                        if (this.properties.record) {
                            rec = new SpeechRecognition();
                            rec.interimResults = true;
                            rec.continuous = true;
                            rec.lang = "en-US";
                            rec.addEventListener("result", this.speech);
                            rec.start();
                        }
                        this.properties.language = !this.properties.language;
                        while (this.elements.keysContainer.children.length > 0) this.elements.keysContainer.children[0].remove();
                        this.elements.keysContainer.appendChild(this._createKeys());
                        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");
                    });
                    break

                case "tab":
                    keyElement.classList.add("tab");
                    keyElement.innerHTML = createIconHTML('keyboard_tab');

                    keyElement.addEventListener("click", () => {
                        this.properties.value += '\t'
                        cursorPos += 1
                    })
                    break

                case "backspace":
                    keyElement.classList.add("backspace");
                    keyElement.innerHTML = createIconHTML("backspace");
                    keyElement.addEventListener("click", () => {
                        input.focus();
                        //удаление символов
                        if (this.properties.start !== this.properties.end) {
                            this.properties.value = this.properties.value.substring(0, this.properties.start)
                                + this.properties.value.substring(this.properties.end, this.properties.value.length);
                        } else
                            this.properties.value = this.properties.value.substring(0, this.properties.start - 1)
                                + this.properties.value.substring(this.properties.end, this.properties.value.length);
                        this._triggerEvent("oninput");
                        input.focus();

                        let range = this.properties.end - this.properties.start;
                        if (range > 0) {
                            this.properties.end -= range;
                        } else {
                            this.properties.start--;
                            this.properties.end--;
                        }

                        if (this.properties.start < 0) this.properties.start = 0;
                        if (this.properties.end < 0) this.properties.end = 0;

                        input.setSelectionRange(this.properties.start, this.properties.end);
                    });
                    break;

                case "sound":
                    keyElement.innerHTML = createIconHTML("volume_up");
                    // keyElement.classList.add("keyboard__key--empty");
                    if (this.properties.sound)
                        keyElement.classList.toggle('keyboard__key_mic');

                    keyElement.addEventListener('click', () => {

                        this.properties.sound = !this.properties.sound;
                        keyElement.classList.toggle('keyboard__key_mic');
                        input.focus();
                    });

                    break;

                case "mic":
                    keyElement.innerHTML = createIconHTML("keyboard_voice");
                    keyElement.classList.add("mic");
                    if (this.properties.record) {
                        keyElement.classList.toggle('keyboard__key_mic');
                    }
                    //recording
                    keyElement.addEventListener('click', () => {
                        if (this.properties.sound) {
                            if (this.properties.language) window.speechSynthesis.speak(new SpeechSynthesisUtterance('record'));
                            else window.speechSynthesis.speak(new SpeechSynthesisUtterance('запись'));
                        }
                        if (this.properties.language) rec.lang = "en-US";
                        else rec.lang = "ru-RU";

                        this.properties.record = !this.properties.record;
                        document.querySelector('.mic').classList.toggle('keyboard__key_mic');

                        if (this.properties.record) {
                            rec.addEventListener("result", this.speech);
                            rec.start();
                        }
                        else {
                            rec.removeEventListener("result", this.speech);
                            rec.stop();
                        }

                        input.focus();
                    });
                    break;

                case "caps":
                    keyElement.classList.add( "keyboard__key--activatable", "caps");
                    keyElement.innerHTML = createIconHTML("keyboard_capslock");

                    keyElement.addEventListener("click", () => {
                        this._toggleCapsLock();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
                    });

                    break;

                case "enter":
                    keyElement.classList.add("keyboard__key--wide", "enter");
                    keyElement.innerHTML = createIconHTML("keyboard_return");
                    keyElement.addEventListener("click", () => {
                        //перенос строки
                        this.properties.value = this.properties.value.substring(0, this.properties.start)
                            + "\n"
                            + this.properties.value.substring(this.properties.end, this.properties.value.length);

                        let range = this.properties.end - this.properties.start;
                        if (range > 0) {
                            this.properties.end -= range;
                        }

                        this.properties.start++;
                        this.properties.end++;
                        this._triggerEvent("oninput");
                        input.focus();
                        input.setSelectionRange(this.properties.start, this.properties.end);
                    });
                    keyElement.addEventListener('keydown', () => {
                        keyElement.classList.toggle("keyboard__key--active");
                    })
                    break;

                case "shift":
                    keyElement.innerHTML = createIconHTML("north");
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable", "shift");
                    if (this.properties.shift === true) keyElement.classList.toggle("keyboard__key_shift");

                    keyElement.addEventListener('click', () => {
                        //change shift
                        this.properties.shift = !this.properties.shift;
                        keyElement.classList.toggle("keyboard__key--active");
                        input.focus();
                        //change case
                        for (let i = 0; i < keyLayout.length; i++) {
                            if (typeof keyLayout[i] !== 'string') { //change of symbols
                                keyLayout[i].reverse();
                                for (const key of this.elements.keys) {
                                    if (key.textContent === keyLayout[i][1]) {
                                        key.textContent = keyLayout[i][0];
                                    }
                                }
                            }
                        }
                        for (const key of this.elements.keys) { //change of letters
                            if (key.childElementCount === 0 && key.textContent !== "en" && key.textContent !== "abc" && key.textContent !== "ABC"
                                && key.textContent !== "ru" && key.textContent !== "абв" && key.textContent !== "АБВ"
                                && key.textContent !== "ctrl") {
                                if (this.properties.capsLock || this.properties.shift) key.textContent = key.textContent.toUpperCase();
                                else key.textContent = key.textContent.toLowerCase();
                                if (this.properties.capsLock && this.properties.shift) key.textContent = key.textContent.toLowerCase();
                            }
                        }
                        document.querySelector('.right').addEventListener('click', (event) => {
                            if (!this.properties.shift) {
                                input.setSelectionRange(this.properties.start = this.properties.end, this.properties.end);
                                input.focus();
                            } else {
                                // highlight right
                                if (this.properties.direction === 'none') this.properties.direction = 'forward';
                                if (this.properties.start <= this.properties.end && this.properties.direction === 'forward') {
                                    this.properties.end++;
                                    if (this.properties.end > this.properties.value.length) this.properties.end = this.properties.value.length;
                                } else this.properties.start++;
                                if (this.properties.start === this.properties.end) this.properties.direction = 'none';
                                input.focus();
                                input.setSelectionRange(this.properties.start, this.properties.end);
                            }
                        });
                        document.querySelector('.left').addEventListener('click', () => {
                            if (!this.properties.shift) {
                                input.setSelectionRange(this.properties.start = this.properties.end, this.properties.end);
                                input.focus();
                            } else {
                                // highlight left
                                if (this.properties.direction === 'none') this.properties.direction = 'backward';
                                if (this.properties.start <= this.properties.end && this.properties.direction === 'backward') {
                                    this.properties.start--;
                                    if (this.properties.start < 0) this.properties.start = 0;
                                } else this.properties.end--;
                                if (this.properties.start === this.properties.end) this.properties.direction = 'none';
                                input.focus();
                                input.setSelectionRange(this.properties.start, this.properties.end);
                            }
                        });
                    })
                    break;

                case "space":
                    keyElement.classList.add("keyboard__key--extra-wide", "space");
                    keyElement.innerHTML = createIconHTML("space_bar");
                    keyElement.addEventListener("click", () => {
                        this.properties.value = this.properties.value.substring(0, this.properties.start)
                            + ' '
                            + this.properties.value.substring(this.properties.end, this.properties.value.length);
                        this.properties.start++;
                        this.properties.end++;
                        this._triggerEvent("oninput");
                        input.focus();

                        let range = this.properties.end - this.properties.start;
                        input.setSelectionRange(this.properties.end - range, this.properties.end - range);
                        if (range > 0) {
                            this.properties.end -= range;
                        }
                    });

                    break;

                case "left":
                    keyElement.classList.add(key);
                    keyElement.innerHTML = createIconHTML("keyboard_arrow_" + key);
                    keyElement.addEventListener('click', () => {
                        //стрелка влево
                        if (!this.properties.shift) {
                            this.properties.start--;
                            this.properties.end--;

                            if (this.properties.start < 0) this.properties.start = 0;
                            if (this.properties.end < 0) this.properties.end = 0;

                            input.setSelectionRange(this.properties.start, this.properties.end);
                        }
                        input.focus();

                    });
                    break;

                case "right":
                    keyElement.classList.add(key);
                    keyElement.innerHTML = createIconHTML("keyboard_arrow_" + key);
                    keyElement.addEventListener('click', () => {
                        //стрелка вправо
                        if (!this.properties.shift) {
                            this.properties.start++;
                            this.properties.end++;

                            if (this.properties.start > this.properties.value.length) this.properties.start = this.properties.value.length;
                            if (this.properties.end > this.properties.value.length) this.properties.end = this.properties.value.length;

                            input.setSelectionRange(this.properties.start, this.properties.end);
                        }
                        input.focus();
                    });
                    break;

                case "done":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = createIconHTML("check_circle");

                    keyElement.addEventListener("click", () => {
                        this.close();
                        this._triggerEvent("onclose");
                    });

                    break;

                default:
                    if (typeof key === 'string') {
                        if (this.properties.capsLock || this.properties.shift)
                            keyElement.textContent = key.toUpperCase();
                        else keyElement.textContent = key.toLowerCase();
                        if (this.properties.capsLock && this.properties.shift)
                            keyElement.textContent = key.toLowerCase();
                    }
                    if (typeof key !== 'string') keyElement.textContent = key[0];

                    keyElement.addEventListener("click", () => {
                        // write symbol on cursor pos
                        let symbol = key;
                        if (typeof symbol !== 'string') symbol = symbol[0];
                        //правила регистра для капса и шифта
                        if (this.properties.capsLock || this.properties.shift) symbol = symbol.toUpperCase();
                        else symbol = symbol.toLowerCase();
                        if (this.properties.capsLock && this.properties.shift) symbol = symbol.toLowerCase();
                        //write symbol into str cursor

                        this.properties.value = this.properties.value.substring(0, this.properties.start)
                            + symbol
                            + this.properties.value.substring(this.properties.end, this.properties.value.length);

                        let range = this.properties.end - this.properties.start;
                        if (range > 0) {
                            this.properties.end -= range;
                        }
                        //move cursor pos
                        this.properties.start++;
                        this.properties.end++;
                        this._triggerEvent("oninput");
                        //return focus to textarea
                        input.focus();
                        //place cursor at the place of writing
                        input.setSelectionRange(this.properties.start, this.properties.end);
                    });
                    break;
            }

            fragment.appendChild(keyElement);
            // if (key === "enter") {
            //     fragment.insertBefore(document.createElement("br", "enter"))
            // }
            if (key === "backspace" || key[0] === "\\" || key === "enter" || key[0] === "." ) {
                fragment.appendChild(document.createElement("br"));
            }

        });

        return fragment;
    },

    _triggerEvent(handlerName) {
        if (typeof this.eventHandlers[handlerName] == "function") {
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;

        for (const key of this.elements.keys) {
            if (key.childElementCount === 0) {
                key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }
        }
    },

    _toggleShift() {
        this.properties.shift = !this.properties.shift;
    },

    open(initialValue, oninput, onclose) {
        this.properties.value = initialValue || "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove("keyboard--hidden");
    },

    close() {
        this.properties.value = "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.add("keyboard--hidden");
    }
};

window.addEventListener("DOMContentLoaded", function () {
    Keyboard.init();
});