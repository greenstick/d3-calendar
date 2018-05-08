/* Calendar Initializer */
var Calendar = function (config) {
    return (typeof(config) === "object" && Array.isArray(config) === false) || typeof(config) === "undefined" ? this.__init__(config) : console.log("Error: Invalid config parameter on Calendar initialization.");
};

/* Calendar Prototype */
Calendar.prototype = {

    /*
    Initialization
    */

    __init__    : function (config) {
        
        var self = this;
        self.parent                 = typeof(config.parent)                 === "string"    ? config.parent                 : "body",
        self.calendarClass          = typeof(config.calendarClass)          === "string"    ? config.calendarClass          : "calendar",
        self.arcClass               = typeof(config.arcClass)               === "string"    ? config.arcClass               : "arc",
        self.segmentClass           = typeof(config.segmentClass)           === "string"    ? config.segmentClass           : "month",
        self.ringClass              = typeof(config.ringClass)              === "string"    ? config.ringClass              : "day",
        self.outerRadius            = typeof(config.outerRadius)            === "number"    ? config.outerRadius            : 364,
        self.innerRadius            = typeof(config.innerRadius)            === "number"    ? config.innerRadius            : 32,
        self.margin                 = typeof(config.margin)                 === "number"    ? config.margin                 : 20,
        self.strokeColor            = typeof(config.strokeColor)            === "string"    ? config.strokeColor            : "rgba(18, 4, 27, 1.0)",
        self.strokeWidth            = typeof(config.strokeWidth)            === "number"    ? config.strokeWidth            : 3,
        self.fillColors             = Array.isArray(config.fillColors)      === true        ? config.fillColors             : ['#0000FF', '#490E7C', '#7438A8', '#AF1BFA', '#FF0000', '#FF7800', '#FFAE00', '#FFF000', '#CCFF00', '#46A81A', '#0F7B00', '#045910', '#20D382', '#05E5D4', '#09AEDB'],
        self.arcStyle               = typeof(config.arcStyle)               === "object"    ? config.arcStyle               : {opacity: 0.6},
        self.arcFocus               = typeof(config.arcFocus)               === "object"    ? config.arcFocus               : {opacity: 0.8},
        self.arcBlur                = typeof(config.arcBlur)                === "object"    ? config.arcBlur                : {opacity: 0.6},
        self.arcSelect              = typeof(config.arcSelect)              === "object"    ? config.arcSelect              : {opacity: 1.0},
        self.duration               = typeof(config.duration)               === "number"    ? config.duration               : 200,
        self.preserveAspectRatio    = typeof(config.preserveAspectRatio)    === "string"    ? config.preserveAspectRatio    : "none",

        // Placeholder Definitions
        self.activeArc              = {},
        self.selectedArc            = {},
        
        /* Computed Variables */

        // Sanitize Class String Inputs
        self.calendarClass  = self.calendarClass.replace(".", ""),
        self.arcClass       = self.arcClass.replace(".", ""),
        self.segmentClass   = self.segmentClass.replace(".", ""),
        self.ringClass      = self.ringClass.replace(".", ""),

        // Set Data Model
        self.datemodel      = {
            year            : new Date().getFullYear(),
            months          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            days            : []
        };

        // Get Days in Month
        for (var i = 1; i <= self.datemodel.months.length; i++) {
            self.datemodel.days.push(new Date(self.datemodel.year, i, 0).getDate());
        }

        // Dimensions & Geometry
        self.radians        = Math.PI / 180,
        self.width          = (self.outerRadius * 2) + (self.margin * 2),
        self.height         = (self.outerRadius * 2) + (self.margin * 2),
        self.ringWidth      = (self.outerRadius - self.innerRadius) / Math.max(...self.datemodel.days),
        self.segmentAngle   = (360 / self.datemodel.months.length),

        // Generate SVG Container
        self.svg            = d3.select(self.parent).append("svg")
                                .attr("class", self.calendarClass)
                                .attr("width", self.width)
                                .attr("height", self.height)
                                .attr("viewbox", "0 0 " + self.width + " " + self.height)
                                .attr("preserveAspectRatio", self.preserveAspectRatio);

        /* Bind Arc Events to Handlers */

        for (var i = 0; i < self.datemodel.months.length + 1; i++) {
            for (var j = 1; j < self.datemodel.days[i] + 1; j++) {

                // Generate SVG Arc
                var arc = d3.arc()
                    .innerRadius(self.innerRadius + (self.ringWidth * j) - (self.strokeWidth * 2))
                    .outerRadius(self.innerRadius + (self.ringWidth * (j + 1)) - (self.strokeWidth * 2))
                    .startAngle(self.segmentAngle * i * self.radians)
                    .endAngle(self.segmentAngle * (i + 1) * self.radians);

                // Append Arc to SVG
                var element = self.svg.append("path")
                    .attr("d", arc)
                    .attr("class", self.arcClass + " " + self.segmentClass + "_" + i + " " + self.ringClass + "_" + j)
                    .attr("data-arc", '{"' + self.ringClass + '":' + j + ',"' + self.segmentClass + '":"' + self.datemodel.months[i] + '","month_index":' + i + '}')
                    .attr("fill", self.fillColors[i])
                    .attr("stroke", self.strokeColor)
                    .attr("stroke-width", self.strokeWidth)
                    .attr("transform", "translate(" + (self.width / 2) + ", " + (self.height / 2) + ")");
                
                // Style Arc
                for (key in self.arcStyle) {
                    element["style"](key, self.arcStyle[key]);
                }

            }
        }

        /* Bind Arc Events to Handlers */

        // Focus Arc
        document.querySelector("body").addEventListener("mouseover", function (e) {
            e.stopPropagation();
            var classes = e.target.classList.value,
                data    = JSON.parse(e.target.getAttribute("data-arc"));
            if (~classes.indexOf(self.arcClass) && !~classes.indexOf("selected")) {
                self.focusArc(data);
            }
        }, false);

        // Blur Arc
        document.querySelector("body").addEventListener("mouseout", function (e) {
            e.stopPropagation();
            var classes = e.target.classList.value,
                data    = JSON.parse(e.target.getAttribute("data-arc"));
            if (~classes.indexOf(self.arcClass) && !~classes.indexOf("selected")) {
                self.blurArc(data);
            }
        }, false);

        // Select & Deselect Arc
        document.querySelector("body").addEventListener("mouseup", function (e) {
            e.stopPropagation();
            var classes = e.target.classList.value,
                data    = JSON.parse(e.target.getAttribute("data-arc"));
            if (~classes.indexOf(self.arcClass) && ~classes.indexOf("selected")) {
                self.deselectArcs(data);
            }
            else if (~classes.indexOf(self.arcClass)) {
                self.deselectArcs(data);
                self.selectArc(data);
            }
        }, false);

        return self;

    },

    /*
    Event Handlers
    */

    // Event Function - Focus Arc
    focusArc    : function (arc) {
        var self = this;
        var selected = d3.select("." + self.arcClass + "." + self.segmentClass + '_' + arc.month_index + '.' + self.ringClass + '_' + arc.day)
            .transition()
            .duration(self.duration);
        // Apply Styles
        for (key in self.arcFocus) {
            selected["style"](key, self.arcFocus[key]);
        }
        self.activeArc = arc;
        console.log(self.activeArc);
        return self;
    },

    // Event Function - Blur Arc
    blurArc     : function (arc) {
        var self = this;
        var selected = d3.select("." + self.arcClass + "." + self.segmentClass + '_' + arc.month_index + '.' + self.ringClass + '_' + arc.day)
            .transition()
            .duration(self.duration);
        // Apply Styles
        for (key in self.arcBlur) {
            selected["style"](key, self.arcBlur[key]);
        }
        return self;
    },

    // Event Function - Select Arc
    selectArc   : function (arc) {
        var self = this;
        var selected = d3.select("." + self.arcClass + "." + self.segmentClass + '_' + arc.month_index + '.' + self.ringClass + '_' + arc.day)
            .classed("selected", true)
            .transition()
            .duration(self.duration)
        // Apply Styles
        for (key in self.arcSelect) {
            selected["style"](key, self.arcSelect[key]);
        }
        self.selectedArc = arc;
        console.log(self.selectedArc);
        return self;
    },

    // Event Function - Deselect Arc
    deselectArcs : function (arc) {
        var self = this;
        var selected = d3.selectAll("." + self.arcClass)
            .classed("selected", false)
            .transition()
            .duration(self.duration);
        // Apply Styles
        for (key in self.arcStyle) {
            selected["style"](key, self.arcStyle[key])
        }
        return self;
    }

};