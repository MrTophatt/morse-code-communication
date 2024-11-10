// Set the variables
let timer = 0
let Text = ""
const morseDictionary: { [key: string]: string } = { // Dictionary to reference morse code
    ".-": "A",
    "-...": "B",
    "-.-.": "C",
    "-..": "D",
    ".": "E",
    "..-.": "F",
    "--.": "G",
    "....": "H",
    "..": "I",
    ".---": "J",
    "-.-": "K",
    ".-..": "L",
    "--": "M",
    "-.": "N",
    "---": "O",
    ".--.": "P",
    "--.-": "Q",
    ".-.": "R",
    "...": "S",
    "-": "T",
    "..-": "U",
    "...-": "V",
    ".--": "W",
    "-..-": "X",
    "-.--": "Y",
    "--..": "Z",
    ".----": "1",
    "..---": "2",
    "...--": "3",
    "....-": "4",
    ".....": "5",
    "-....": "6",
    "--...": "7",
    "---..": "8",
    "----.": "9",
    "-----": "0",
    ".-.-.-": ".",
    "--..--": ",",
    "..--..": "?",
    ".----.": "'",
    "-.-.--": "!",
    "-....-": "-",
    "-..-.": "/",
    ".-..-.": "\"",
    "---...": ":",
    "-.-.-.": ";",
    "-.--.": "(",
    "-.--.-": ")",
    "..--.-": "_",
    ".-.-.": "+",
    "-...-": "=",
    ".-...": "&",
    ".--.-.": "@",
    "...-..-": "$"
};
let packetReceived: string[] = [];
radio.setFrequencyBand(0)
radio.setTransmitPower(7)
radio.sendMessage(radio.__message(0)) // Initial ping

// Set starting display to show all LED
basic.showLeds(`
    # # # # #
    # # # # #
    # # # # #
    # # # # #
    # # # # #
    `)

/**
 * Decipers the morse code into readable english text.
 * 
 * Eg: ...---... => SOS
 * 
 * @param morseCode The morse code to be translated
 * @returns The translated morse code
 */
function DecipherMorseCode(morseCode: string) { // Deciphers the morse code into text
    return morseCode.split("/") // Split by words
        .map(word => word.split(" ") // Split by individual letters
            .map(letter => morseDictionary[letter] || letter) // Translate each letter
            .join("") // Join letters into a word
        ).join(" ")
}


/**
 * RADIO SENDING AND RECEIVING
 */
input.onButtonPressed(Button.AB, function () { // When both buttons are pressed send the deciphered morse code
    if (!input.isGesture(Gesture.LogoDown)) {
        basic.showLeds(`
        . . . . #
        . . . # #
        . . # # #
        . # # # #
        # # # # #
        `)

        for (let i = 0; i < Text.length; i += 19) {
            radio.sendString(Text.slice(i, i + 19));
        }
        radio.sendString("END");
        basic.showIcon(IconNames.Yes)
    }
})
radio.onReceivedString(function (receivedString) { // Receives the signal
    if (!input.isGesture(Gesture.LogoDown)) {
        basic.clearScreen()

        packetReceived.push(receivedString) // Puts the received packet into an array to be used later
        if (packetReceived[packetReceived.length-1]=="END") { // When the last packet is received...
            packetReceived.pop() // Remove the last element (The "END" packet)
            let message = packetReceived.join("") // Join all the packets together to create the message

            basic.showString(DecipherMorseCode(message)) // Displays the received message
            packetReceived = [] // Resets the packet array
        }
    }
})

/**
 * BUTTON CONTROLS
 */
basic.forever(function () {
    if (!input.isGesture(Gesture.LogoDown)) {
        if (input.buttonIsPressed(Button.A) && !(input.buttonIsPressed(Button.B))) { // Checks to see of only A is pressed
            while (input.buttonIsPressed(Button.A)) { //Adds 1 to the timer every 100ms
                timer += 1
                basic.pause(100)
            }
            // Once A button is no longer selected add a dot or dash to the text string
            if (timer < 3) Text += "."
            else Text += "-"
            timer = 0
        } else if (input.buttonIsPressed(Button.B) && !(input.buttonIsPressed(Button.A))) { // Checks to see of only B is pressed
            while (input.buttonIsPressed(Button.B)) { //Adds 1 to the timer every 100ms
                timer += 1
                basic.pause(100)
            }
            // Once B button is no longer selected add a space or forward slash to the text string
            if (timer < 3) Text += " "
            else Text += "/"
            timer = 0
        }
    }
})
// LED Screen to show what is being selected
// Adding this peice of code to the incrementing timer while loop would slow the loop too much
basic.forever(function () {
    if (!input.isGesture(Gesture.LogoDown)) {
        if (input.buttonIsPressed(Button.A)) { //Checks to see if the A button is pressed
            if (timer < 3) basic.showLeds(`
                . . . . .
                . . . . .
                . . # . .
                . . . . .
                . . . . .
                `) // Shows a dot if the timer is less than 3
            else basic.showLeds(`
                . . . . .
                . . . . .
                . # # # .
                . . . . .
                . . . . .
                `) // Shows a dash if the timer is greater than or equal to 3
        } else if (input.buttonIsPressed(Button.B)) {
            if (timer < 3) basic.showLeds(`
                . . . . .
                . . . . .
                . . . . .
                . . # . .
                . # . . .
                `) // Shows a comma if the timer is less than 3
            else basic.showLeds(`
                . . . . #
                . . . # .
                . . # . .
                . # . . .
                # . . . .
                `) // Shows a forward slash if the timer is greater than or equal to 3
        }
    }
})

input.onGesture(Gesture.Shake, function() { // When shaken, clear the text and show a full LED screen
    if(!input.isGesture(Gesture.LogoDown)) {
        Text = ""
        basic.showLeds(`
        # # # # #
        # # # # #
        # # # # #
        # # # # #
        # # # # #
        `)
    }
})

input.onGesture(Gesture.LogoDown, function () { // When the Micro:Bit is upside down, send an SOS signal
    while (input.isGesture(Gesture.LogoDown)) {
        basic.showLeds(`
            . . . . #
            . . . # #
            . . # # #
            . # # # #
            # # # # #
            `)
        radio.sendString("... --- ...")
        radio.sendString("END");
        basic.showIcon(IconNames.Yes)
        basic.pause(5000)
    }
})
