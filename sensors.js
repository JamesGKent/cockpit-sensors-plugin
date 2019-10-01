var init = false;

function sensors_on_load() {
	setInterval(get_sensors, 1000);
	get_sensors();
}
		
function get_sensors() {
	var proc = cockpit.spawn(["sensors", "-u"]);
	proc.stream(sensors_output);
}

function sensors_output(data) {
	var table = document.getElementById("sensors-table");
	
	var current_adaptor = null;
	var current_cpu = 0;
	var current_gpu = 0;
	var current_core = null;
	
	var lines = data.split('\n');
	for (var i = 0;i < lines.length;i++){
		if (current_adaptor == null) {
			if (lines[i].startsWith('coretemp')) {
				current_adaptor = 'CPU' + parseInt(lines[i].split('-').pop())
				if (init == false) {
					var row = table.insertRow(-1);
					var header = document.createElement("TH");
					header.innerHTML = current_adaptor;
					header.colSpan = "4";
					row.append(header);
					var row = table.insertRow(-1);
					row.innerHTML = "<td></td><td>Current</td><td>Max.</td><td>Crit.</td>";
				}
			} else if (lines[i].startsWith('k10temp')) {
				current_adaptor = 'CPU' + current_cpu;
				if (init == false) {
					var row = table.insertRow(-1);
					var header = document.createElement("TH");
					header.innerHTML = current_adaptor;
					header.colSpan = "4";
					row.append(header);
					var row = table.insertRow(-1);
					row.innerHTML = "<td></td><td>Current</td><td>Max.</td><td>Crit.</td>";
				}	
			} else if (lines[i].startsWith('radeon')) {
				current_adaptor = 'GPU' + current_gpu;
				if (init == false) {
					var row = table.insertRow(-1);
					var header = document.createElement("TH");
					header.innerHTML = current_adaptor;
					header.colSpan = "4";
					row.append(header);
					var row = table.insertRow(-1);
					row.innerHTML = "<td></td><td>Current</td><td>Max.</td><td>Crit.</td>";
				}	
                        } else if (lines[i].startsWith('cpu_thermal-virtual-0')) {
                                current_adaptor = 'temp' + current_cpu;
                                if (init == false) {
                                        var row = table.insertRow(-1);
                                        var header = document.createElement("TH");
                                        header.innerHTML = current_adaptor;
                                        header.colSpan = "4";
                                        row.append(header);
                                        var row = table.insertRow(-1);
                                        row.innerHTML = "<td></td><td>Current</td><td>Max.</td><td>Crit.</td>";
                                }
			} 
		} else if (lines[i] == '') {
			current_adaptor = null;
			current_core = null;
		} else {
			if (current_adaptor != null) {
				if (lines[i].startsWith('Core') || lines[i].startsWith('temp')) {
					current_core = lines[i].replace(':', '');
					if (init == false) {
						var row = table.insertRow(-1);
						var name = row.insertCell(-1);
						name.innerHTML = current_core
						var temp_current = row.insertCell(-1);
						temp_current.id = current_adaptor + '-' + current_core + '-current';
						var temp_max = row.insertCell(-1);
						temp_max.id = current_adaptor + '-' + current_core + '-max';
						var temp_crit = row.insertCell(-1);
						temp_crit.id = current_adaptor + '-' + current_core + '-crit';
					}
				} else if (lines[i].startsWith(" ")) {
					var bits = lines[i].split(":");
					var id = current_adaptor + '-' + current_core + '-current';
					var temp_current = document.getElementById(id);
					id = current_adaptor + '-' + current_core + '-max';
					var temp_max = document.getElementById(id);
					id = current_adaptor + '-' + current_core + '-crit';
					var temp_crit = document.getElementById(id);
					id = null;
					if (bits[0].endsWith('input')) {
						id = current_adaptor + '-' + current_core + '-current';
					} else if (bits[0].endsWith('max')) {
						id = current_adaptor + '-' + current_core + '-max';
					} else if (bits[0].endsWith('crit')) {
						id = current_adaptor + '-' + current_core + '-crit';
					}
					if (id != null) {
						var elem = document.getElementById(id);
						elem.innerHTML = bits[1];
					}
					if (parseFloat(temp_current.innerHTML) >= parseFloat(temp_crit.innerHTML)) {
						temp_current.className = "crit";
					} else if (parseFloat(temp_current.innerHTML) >= parseFloat(temp_max.innerHTML)) {
						temp_current.className = "max";
					} else {
						temp_current.className = "";
					}
				}
			}
		}
	}
	init = true;
}

document.addEventListener('DOMContentLoaded', sensors_on_load)
