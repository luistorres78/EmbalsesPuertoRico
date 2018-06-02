
////////////////////////////////////////////////////////
// embalse.js
// Elio Ramos & Estudiantes del Curso Comp4019
// Universidad de Puerto Rico en Humacao
// Contiene un conjunto de funciones en JS para procesar
// y graficar los datos de los embalses. Por razones
// obvias la funcion de graficar esta incompleta..
// /////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////
// funcion para redondear un decimal a un cierto numero de cidras
/////////////////////////////////////////////////////////////////

    function precisionRound(number, precision) {
        var factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
    }


//////////////////////////////////////////////////////////////
// funcion para regresar el nombre del embalse a partir del ID
//////////////////////////////////////////////////////////////


    function regresaNombre(embalseID)
    {
       var nombre;

       switch(embalseID)
       {
           case ("50059000"):
               nombre = "Carraizo";
               break;
           case ("50045000"):
               nombre = "La Plata";
               break;
           case ("50047550"):
               nombre = "Cidra";
               break;
           case ("50093045"):
               nombre = "Patillas";
               break;
           case ("50111210"):
               nombre = "Toa Vaca";
               break;
           case ("50076800"):
               nombre = "Rio Blanco";
               break;
           case ("50026140"):
               nombre = "Caonillas";
               break;
           case ("50071225"):
               nombre = "Fajardo";
               break;
           case ("50113950"):
               nombre = "Cerrillos";
               break;
            case ("50039995"):
                nombre = "Carite"; break;
            case ("50010800"):
                nombre = "Guajataca"; break;
       }

       return nombre;
    }


//////////////////////////////////////////////////////
// funcion para generar el URL de USGS a partir del ID
//////////////////////////////////////////////////////


    function urlEmbalse(embalseID)
    {
        var url1 = 'https://waterdata.usgs.gov/pr/nwis/uv/?format=rdb&site_no=';
        var url2 = embalseID.concat('&period=1');

        var url = url1.concat(url2);

        return url;
    }



////////////////////////////////////////////////////////////////////////////////////
// funcion para generar el nombre del archivo LOCAL en caso de que no halla internet
////////////////////////////////////////////////////////////////////////////////////

    function urlEmbalseLocal(embalseID)
    {
        var url = embalseID.concat(".txt");

        return url;
    }


///////////////////////////////////////////////////////////
//  funcion para filtrar los datos crudos de un URL de USGS
///////////////////////////////////////////////////////////

    function filtraDatos(tabla)
    {
        // un filtrado parecido a este lo hicimos con PHP

        datos = [];
        var npos = tabla.search("agency") - 1;
        tabla = tabla.substr(npos,tabla.length);
        tablaArray = tabla.split("USGS");

        // esto crea un arreglo de dos columnas..
        // tiempo y nivel

        for(var i=1; i < tablaArray.length;i++)
        {
           var temp = tablaArray[i].split("\t");
           tempTiempo = temp[2].split(" ");
           tempFecha = tempTiempo[0].split("-");
           tempHora  = tempTiempo[1].split(":");
           datos.push({tiempo: new Date(tempFecha[0],
                                        tempFecha[1]-1,
                                        tempFecha[2],
                                        tempHora[0],
                                        tempHora[1]),
                       nivel: parseFloat(temp[temp.length - 2])});
        }

        return datos;
    }



/////////////////////////////////////////////////////////////////////////////////
//  funcion para definir una grafica compatible con leaflet para un SOLO marcador
//  le damos el nombre del conjunto de datos..el titulo..y una variable asociada
//  al elemento div
/////////////////////////////////////////////////////////////////////////////////


   function graficaMarcador(dataset,titulo,div)
   {

        var w = 300;
        var h = 300;

        // margenes del grafico

        var margin_x = 50;
        var margin_y = 50;

        var xScale, yScale, line;

        var xAxisBottom,xAxisTop,yAxisLeft,yAxisRighit;

        // definir formato de tiempo en horas, minutos, am y pm

        var formatTime = d3.timeFormat("%-I:%M %p");

        // esto es para generar dos arreglo a partir de la estructura de datos dataset

        ax = dataset.map((item) => item.tiempo);
        ay = dataset.map((item) => item.nivel);

        // limites superiores e inferiores

        var xLowLim = d3.min(ax);
        var xUpLim  = d3.max(ax);

        // esto es que los limites en y correspondan al rango de los datos

        var eps = 0.001;

        var yLowLim = (1 - eps)*d3.min(ay);
        var yUpLim  = (1 + eps)*d3.max(ay);


        // funciones de escala

        xScale = d3.scaleTime()
                   .domain([xLowLim,xUpLim])
                   .range([0 + margin_x,w - margin_x]);

        yScale = d3.scaleLinear()
                   .domain([yLowLim,yUpLim])
                   .range([h - margin_y,0 + margin_y]);

        // Gridlines
	
	var yGridlines =  d3.axisBottom(xScale)
                    .tickFormat(" ")
		    .tickSize(margin_x + margin_y - h)
                    .scale(xScale);
	var xGridlines =  d3.axisLeft(yScale)
                    .tickFormat(" ")
		    .tickSize(margin_x + margin_y - w)
                    .scale(yScale);
		 

        // generador de coordenadas para la linea

        line = d3.line()
                    .x(function(d) { return xScale(d.tiempo); })
                    .y(function(d) { return yScale(d.nivel); });

        // primer eje de x
        // esto muestra los datos cada 8 horas...y en formato de tiempo

        xAxisBottom = d3.axisBottom()
                        .scale(xScale)
                        .ticks(d3.timeHour.every(8))
                        .tickFormat(formatTime)
                        .tickSizeOuter(0)
                        .tickSizeInner(3)

        // segundo eje de x

        xAxisTop = d3.axisTop()
                     .scale(xScale)
                     .tickSizeOuter(0)
                     .tickSizeInner(0)
                     .tickFormat("");


        // primer eje de y

        yAxisLeft  = d3.axisLeft()
                       .scale(yScale)
                       .tickSizeOuter(0)
                       .tickSizeInner(3);

        // segundo eje de y

        yAxisRight = d3.axisRight()
                       .scale(yScale)
                       .tickSizeOuter(0)
                       .tickSizeInner(0)
                       .tickFormat("");
	

        // para crear el SVG


        var svg = d3.select(div)
            .select("svg")
            .attr("width", w)
            .attr("height", h);

	
	   // localizacion gridlines
	
 	svg.append("g")
     	   .attr("class", "grid")
     	   .attr("transform","translate(" + margin_x + ",0)")
     	   .call(xGridlines);

	svg.append("g")
           .attr("class", "grid")
           .attr("transform","translate(0," + (h - margin_y) + ")")
           .call(yGridlines);

	   // para crear la linea

        svg.append("path")
            .datum(dataset)
            .attr("class", "line")
            .attr("d", line);


        // localizacion de los ejes	   

        svg.append("g")
            .style("font-size","9px")
            .attr("class","axisBottom")
            .attr("transform","translate(0," + (h - margin_y) + ")")
            .call(xAxisBottom)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"
            });

        svg.append("g")
            .attr("class","axisTop")
            .attr("transform","translate(0," + (margin_y) + ")")
            .call(xAxisTop);

        svg.append("g")
            .attr("class","axisLeft")
            .attr("transform","translate(" + (margin_x) + ",0)")
            .call(yAxisLeft);

        svg.append("g")
            .attr("class","axisRight")
            .attr("transform","translate(" + (w - margin_x) + ",0)")
            .call(yAxisRight);
	
       
	

	// TITULO
	
	svg.append("text")
                 .attr("transform","translate("+ w/2 +","+ margin_y/2 +")")
                 .style("text-anchor","middle")
	         .style("font-size", "14px")
		.text(function(){
		var fecha = d3.timeFormat(" %d/%m/%Y %H:%M");
		var max = d3.max(ax);

		return titulo +fecha(max);
		}); 

        // nivel minimo, nivel maximo, ..etc
	svg.append("text")
	   .attr("transform","translate("+ w/2 +"," + 4 *margin_y/5 +")")
	   .style("text-anchor","middle")
	   .style("font-size", "14px")
	   .text(function(){
		   var maximo = d3.max(ay);
		   var minimo = d3.min(ay);
		   maximo = precisionRound(maximo, 2);
		   minimo = precisionRound(minimo, 2);

		   return "Nivel m\u00EDnimo: " + minimo + "m m\u00E1ximo: " + maximo + "m";
	   })
        // etiqueta del eje de y

        svg.append("text")
                 .attr("transform","translate(10,"+(h/2)+") rotate(-90)")
                 .style("text-anchor","middle")
                 .text("Nivel [metros]");
 }

function nivelBarra(arreglo, i, desborde, ajuste, control)
{
        var size = arreglo["length"];
        var nivel = arreglo[size - 1]["nivel"];
        var embalse;
        var normalizado;
        var unidad_adicional = ajuste - control;
        var max = desborde + unidad_adicional;
        var min = control - unidad_adicional;
    
        var escala = max - min;
        var nivel_ajustado = nivel - min;
        
        // Ajuste a pixeles icono
        normalizado = 43 * (nivel_ajustado/escala);
        normalizado = Math.round(normalizado * 100) / 100;

        if(normalizado > 43 || normalizado == 0)
            normalizado = 43;
        
        return normalizado;
}


// Funcion para devolver color del nivel en barra
function colorBarra(arreglo, i, desborde, seguridad, observacion, ajuste)
{
    var size = arreglo["length"];
    var nivel = arreglo[size - 1]["nivel"];
    var color;

        
    // Determinar color de acuerdo a los datos sin normalizar
    if(nivel >= desborde)
        color = "lightblue";
    else if(nivel >= seguridad)
        color = "green";
    else if(nivel >= observacion)
        color = "blue";
    else if(nivel >= ajuste)
        color = "yellow";
    else
        color = "orange";

    if(nivel == 0 || nivel == null || nivel < 5)
        color = "gray";

        return color;
    
    
}

//***************************
// Calcular la pendiente del*
// Dataset para la tendencia*
//***************************

function flecha(arreglo){
	
	var m;
	var direccion;
    var size = arreglo["length"];
    var Y1, Y2, X1, X2;
    X1 = Number(size - 1);
	X2 = Number(size-10);
	Y1 = Number(arreglo[X1]["nivel"]);
    Y2 = Number(arreglo[X2]["nivel"]);
    
    m = (Y2 - Y1)/(X2 - X1);

    if(m == 0)
		direccion = 'constant-arrow.png';
	else if(m < 0)
		direccion = 'down-arrow.png';
	else if(m > 0)
		direccion = 'up-arrow.png';

	return direccion;
			

}

function getLevel(arreglo)
{
    var size = arreglo["length"];
    var nivel = arreglo[size-1]["nivel"];
    nivel = Math.round(nivel*100)/100;
    return nivel;
}


function regresaEstado(embalse, dataset)
{
    
    var nivel = getLevel(dataset);
    var estado;
    
    // Determinar color de acuerdo a los datos sin normalizar
    if(nivel >= embalse[3])
        estado = "Desborde";
    else if(nivel >= embalse[4])
        estado = "Seguridad";
    else if(nivel >= embalse[5])
        estado = "Observacion";
    else if(nivel >= embalse[6])
        estado = "Ajuste";
    else
        estado = "Control";

    if(nivel <=5 || nivel == null)
        estado = "No Disponible";

        return estado;
}

