
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
               nombre = "La_Plata";
               break;
           case ("50047550"):
               nombre = "Cidra";
               break;
           case ("50093045"):
               nombre = "Patillas";
               break;
           case ("50111210"):
               nombre = "Toa_Vaca";
               break;
           case ("50076800"):
               nombre = "Rio_Blanco";
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


        // funcion para la cuadricula del eje de x


        // funcion para la cuadricula del eje de y


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


        // para crear la linea

        svg.append("path")
            .datum(dataset)
            .attr("class", "line")
            .attr("d", line);

        // localizacion de los ejes..noten que
        // lo que hay que hacer para rotar levemente las horas..

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


        // titulo


        // nivel minimo, nivel maximo, ..etc


        // etiqueta del eje de y

        svg.append("text")
                 .attr("transform","translate(10,"+(h/2)+") rotate(-90)")
                 .style("text-anchor","middle")
                 .text("Nivel [metros]");

        // cuadricula del eje de x


        // cuadricula del eje de y
 }
