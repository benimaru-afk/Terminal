const input = document.getElementById("input");
const output = document.getElementById("output");
const terminal = document.querySelector('.terminal');

// ASCII art banner displayed on startup
const asciiHeader = `
██████╗    ██████╗    ███╗   ███╗        ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     
██╔══██╗   ██╔══██╗   ████╗ ████║        ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     
██████╔╝   ██████╔╝   ██╔████╔██║           ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     
██╔══██╗   ██╔══██╗   ██║╚██╔╝██║           ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║     
██████╔╝██╗██║  ██║██╗██║ ╚═╝ ██║           ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝           ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
`;

const asciiElement = document.createElement("pre");
asciiElement.textContent = asciiHeader;
output.appendChild(asciiElement);

// Emulated file system
const fileSystem = {
    "": {
        type: "directory",
        children: {
            "resume": {
                type: "directory",
                children: {
                    "NMT CSE 113 Grader": "Graded assignments, ensured consistency, gave feedback, collaborated with instructor.",
                    "NMT Resident Assistant": "Trained in mental health & emergency response, guided students, ran outreach.",
                    "NMT SGA Web Master": "Maintained student gov site, ensured usability, updated HTML/CSS content.",
                    "R&D Intern at Sandia National Labs": "Cybersecurity intern working in research on classified projects.",
                    "Sandia Prep IT Support Staff": "Configured networks, servers, maintained devices, rebuilt school infrastructure.",
                    "Stanford AI ML Researcher": "Participated in ML research, studied facial recognition and model tuning."
                }
            },
            "projects": {
                type: "directory",
                children: {
                    "Aeroscape": "A game made in Unity about planet hopping and resource management.",
                    "Donut Store": "Small business inventory tracker written in JavaScript and SQLite.",
                    "Inn": "Text adventure game using C++ with modular structure.",
                    "Lisp Interpreter": "Functional programming interpreter built in Python.",
                    "Network Node Communication": "TCP/IP Python socket project simulating node routing.",
                    "SWE Casino": "JS WebApp with shared wallet across games like blackjack, plinko, slots.",
                    "Wheels": "Mini car controller using Arduino C and PWM logic.",
                    "WSN Simulation": "OMNeT++ project for Wireless Sensor Networks using AODV/Flooding."
                }
            }
        }
    }
};

let currentPath = "";
const pathStack = [];

function getDirectory(path) {
    const parts = path.split('/').filter(Boolean);
    let node = fileSystem[""];
    for (const part of parts) {
        if (node.children?.[part] && typeof node.children[part] === "object") {
            node = node.children[part];
        } else {
            return null;
        }
    }
    return node;
}

function formatLs(path) {
    const dir = getDirectory(path);
    if (!dir || dir.type !== "directory") return `ls: Cannot access directory`;

    let output = `\n    Directory: C:\\Terminal${path ? "\\" + path.replaceAll("/", "\\") : ""}\n\n`;
    output += `Mode                 LastWriteTime         Length Name\n`;
    output += `----                 -------------         ------ ----\n`;

    for (const [name, value] of Object.entries(dir.children)) {
        const isDir = typeof value === "object";
        const mode = isDir ? (name === "resume" ? "dar--l" : "d----l") : "-a---l";
        const size = isDir ? "" : (Math.floor(Math.random() * 1500) + 500).toString();
        const date = "7/5/2025   2:4" + Math.floor(Math.random() * 5) + " PM";
        output += `${mode.padEnd(21)}${date.padEnd(24)}${size.padEnd(8)}${name}\n`;
    }

    return output;
}

function changeDirectory(target) {
    if (target === "..") {
        if (pathStack.length) pathStack.pop();
    } else if (target.startsWith("./") || target.startsWith(".\\")) {
        const dir = target.replace(/^.\//, "").replace(/^.\\/, "");
        const current = getDirectory(currentPath);
        if (current && current.children[dir] && typeof current.children[dir] === "object") {
            pathStack.push(dir);
        } else {
            return `cd: ${dir}: No such directory`;
        }
    } else {
        return `cd: Invalid path`;
    }
    currentPath = pathStack.join('/');
    return "";
}

function selectItem(name) {
    const dir = getDirectory(currentPath);
    if (dir && dir.children?.[name]) {
        const data = dir.children[name];
        return typeof data === "string" ? data : `select: ${name} is not a file`;
    }
    return `select: ${name} not found`;
}

function formatPrompt() {
    return `PS C:\\Terminal${currentPath ? "\\" + currentPath.replaceAll("/", "\\") : ""}>`;
}

function handleCommand(cmd) {
    const outputLine = document.createElement("div");
    outputLine.classList.add("output-line");

    let response = "";
    const [command, ...args] = cmd.split(" ");
    const joinedArgs = args.join(" ").trim();

    switch (command.toLowerCase()) {
        case "ls":
            response = formatLs(currentPath);
            break;
        case "cd":
            response = changeDirectory(joinedArgs);
            break;
        case "select":
            response = selectItem(joinedArgs);
            break;
        case "clear":
            output.innerHTML = "";
            return;
        case "help":
            response = `Available commands:\n- ls\n- cd ./<dir>\n- cd ..\n- select <item>\n- clear\n- help`;
            break;
        default:
            response = `Command not found: ${command}`;
    }

    if (response) {
        const text = document.createElement("pre");
        text.textContent = response;
        output.appendChild(text);
    }
}

input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const commandText = input.value.trim();
        const promptLine = document.createElement("div");
        promptLine.classList.add("output-line");
        promptLine.innerHTML = `<span>${formatPrompt()}</span> ${commandText}`;
        output.appendChild(promptLine);

        handleCommand(commandText);
        input.value = "";
        output.scrollTop = output.scrollHeight;
    }
});

// Glitch effect
function triggerGlitch() {
    terminal.classList.add('glitch');
    setTimeout(() => terminal.classList.remove('glitch'), 300); // glitch lasts 300ms

    // Glitch every 5–10 seconds
    const nextGlitchIn = Math.random() * 5000 + 5000;
    setTimeout(triggerGlitch, nextGlitchIn);
}
setTimeout(triggerGlitch, Math.random() * 5000 + 5000);

setTimeout(triggerGlitch, Math.random() * 30000 + 30000);
