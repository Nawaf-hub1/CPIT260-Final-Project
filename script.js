document.getElementById("btn1").addEventListener("click", function() {
    let numberOfProcesses = document.getElementById("processes").value;
    let inputsDiv = document.getElementById("inputsDiv");
    inputsDiv.innerHTML = '<input type="number" id="quantumTime" name="quantumTime" placeholder="Quantum Time" required>';
    
    for (let i = 0; i < numberOfProcesses; i++) {
        inputsDiv.innerHTML += 
        `<div>
            <label for="process${i}">Process ${i + 1}</label>
            <input type="number" id="arrivalTime${i}" name="arrivalTime${i}" placeholder="Arrival Time" required>
            <input type="number" id="burstTime${i}" name="burstTime${i}" placeholder="Burst Time" required>
        </div>`;
    }
    inputsDiv.innerHTML += `<button id="submitInfo">Submit</button>`;

    // Properly add event listener to the dynamically created submit button
    document.getElementById("submitInfo").addEventListener("click", function() {
        submitProcessData(numberOfProcesses);
    });
});

function submitProcessData(numberOfProcesses) {
    let quantumTime = parseInt(document.getElementById("quantumTime").value);
    let processesArray = [];
    let readyQueueArray = [];
    let resultsArray = [];
    let counter = 0;

    // Initialize processes using PCB function
    for (let i = 0; i < numberOfProcesses; i++) {
        let arrivalTime = parseInt(document.getElementById(`arrivalTime${i}`).value);
        let burstTime = parseInt(document.getElementById(`burstTime${i}`).value);
        PCB(`p${i}`, arrivalTime, burstTime, i, processesArray);
    }

    // Sort processesArray by arrivalTime in ascending order
    processesArray.sort((a, b) => a.arrivalTime - b.arrivalTime);

// Execute the scheduling logic
while (processesArray.length > 0 || readyQueueArray.length > 0) {
    dispatcher(processesArray, readyQueueArray, counter, quantumTime);

    // Loop over the ready queue processes but ensure each process only gets a quantum slice each round
    if (readyQueueArray.length > 0) {
        let workingProcess = readyQueueArray.shift(); // Take the first process from the queue
        // Calculate the time slice to use, either the full quantum or whatever burst remains, whichever is less
        let timeSlice = Math.min(workingProcess.burstTime, quantumTime);
        // Reduce the burst time by the time slice used
        workingProcess.burstTime -= timeSlice;
        // Update the global counter to reflect the time passage
        counter += timeSlice;
        if (workingProcess.burstTime > 0) {
            // If the process is not finished, add it back to the end of the queue
            readyQueueArray.push(workingProcess);
        } else {
            // If the process has completed its execution
            workingProcess.completionTime = counter;
            resultsArray.push(workingProcess);
        }
    } else {
        // If there are no processes ready to run, simply advance the counter
        counter++;
    }
}
    // Display results
    displayResults(resultsArray);
}

function PCB(pName, AT, BT, processNumber, processesArray) {
    processesArray[processNumber] = {
        name: pName,
        arrivalTime: AT,
        burstTime: BT,
    };
}

function dispatcher(processesArray, readyQueueArray, counter, quantumTime) {
    for (let i = 0; i < processesArray.length; i++) {
        if (processesArray[i].arrivalTime <= counter) {
            // Add the process to the front of the ready queue
            readyQueueArray.unshift(processesArray[i]);
            // Remove the process from the processes array
            processesArray.splice(i, 1);
            // Adjust the index to account for the change in the array length
            i--;
        }
    }
}

function displayResults(resultsArray) {
    let resultsDiv = document.getElementById("resultsDiv");
    resultsDiv.innerHTML = ''; // Clear previous results
    resultsArray.forEach(process => {
        process.turnAroundTime = process.completionTime - process.arrivalTime;
        process.waitingTime = process.turnAroundTime - process.burstTime;
        process.responseTime = process.waitingTime; // Assuming the response time is the same as waiting time
        resultsDiv.innerHTML += `Process ${process.name}: Completion Time = ${process.completionTime}, Turn Around Time = ${process.turnAroundTime}, 
        Waiting Time = ${process.waitingTime}, Response Time = ${process.responseTime}<br>`;
    });
}