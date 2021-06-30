var Subway = function (element, options) {
    this.element = $(element);
    this.options = $.extend(true, {}, this.options, options);
    this.init();
}
Subway.prototype = {
    options: {
        id: "demo", //
        data: null, //
        num: null, //    筛选线路 对应某条线
        showBtns: 1, //线路筛选按钮  1:显示   0:隐藏
        dblClick: null, //是否有双击事件  dblClick=1 才有双击事件
    },

    init: function () {
        var me = this,
            el = me.element,
            opts = me.options;

        me.loadData(opts.data);

        el.on("click", ".showline", function (e) {
            var tagName = this.tagName;
            var name = $(this).attr("name");
            var wbs_guid = me.getGuidByName(name, tagName);

            if (tagName == "line") {

            } else {
                tagName = "site"
            }
            opts.itemDblClick.call(me, wbs_guid, tagName, name);

        })




        //btns 滚动操作
        var scrollOffset = 10;

        function startScroll(value) {
            function step() {
                $(".power-lines-btns")[0].scrollTop += value;
                timer = setTimeout(step, 30);
            }

            var timer;

            $(document).mouseup(function () {
                if (timer) clearTimeout(timer);
            });

            timer = setTimeout(step, 30);
        }


        $(document.body).on("mousedown", ".power-lines-up", function (e) {

            startScroll(-scrollOffset);
        })
        $(document.body).on("mousedown", ".power-lines-down", function (e) {
            startScroll(scrollOffset);
        })


    },

    loadData: function (data) {
        var me = this;
        me.options.data = data || null;

        if (!me.options.data) return;
        //重新绘制按钮组
        $(".lines-wrap").remove();
        //创建btns
        me._renderLinesWrap(me.options.data.target);
        this.refresh();
    },
    refresh: function () {
        var me = this;
        me.svg = null;

        $("svg#demo").remove();
        this._render();
    },
    showLine: function (num) {
        this.options.num = num;
        this.refresh();

    },
    _toHref: function (info) {
        
        var me = this;
        if ($(info).attr("name") == "清水浦") {
            //window.location.href = "/PowerPlat/FormXml/zh-CN/StdMetro/Win_PS_MapNode.htm";
        }
    },
    _render: function () {
        var me = this,
            el = me.element,
            svgId = me.options.id,
            data = me.options.data;


        if (!data) return;

        me.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        me.svg.setAttribute("id", svgId);
        me.svg.setAttribute("width", "100%");
        me.svg.setAttribute("height", "100%");

        this._renderMetro();

        el.append(me.svg);
        // var tips = $(".showline").tooltip({

        // })

    },
    _renderMetro: function () {
        var me = this;

        var subDatas = me.options.data.target;
        var sites = me.options.data.sites;

        $("svg#demo").css("marginRight", "-50px");

        //绘制背景tsy
        me._createBackground();

        for (var i = 0; i < subDatas.length; i++) {
            var subData = subDatas[i];

            me.nowLine = i + 1;

            //绘制线路
            me._createLine(subData);

            //绘制站点
            me._renderStations(subData);

            //绘制筛选按钮


            delete me["nowLine"];
        }
        for (var i = 0; i < sites.length; i++) {

            var site = sites[i];
            if (site.rp) {

                me._createImage(site);

            }
        }

    },
    _renderStations: function (subData) {


        var me = this;
        var stations = subData.sites;
        var sites = me.options.data.sites;

        for (var i = 0; i < stations.length; i++) {
            var a = stations[i];
            //站点名称
            me._createText(a);
            //站点⚪
            me._createCircle(a, subData["color"])
            //  me._createImage(a);
        }

    },
    _createBackground: function () {
        var me = this,
            showNum = me.options.num,
            nowLine = me.nowLine;



        img = document.createElementNS('http://www.w3.org/2000/svg', 'image');

        img.setAttribute("x", "100");
        img.setAttribute("y", "50");
        img.setAttribute("href", "./mapbackground.jpg");
        //img.setAttribute("width", 3000);
        //img.setAttribute("height",1500);





        me.svg.appendChild(img);
    },
    _createLine: function (subData) {
        var me = this,
            showNum = me.options.num,
            nowLine = me.nowLine;
        var lines = subData.lines;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var svgline = document.createElementNS('http://www.w3.org/2000/svg', 'line');

            //线路、样式、name、title
            svgline.setAttribute("line", nowLine);
            svgline.setAttribute("class", "showline");
            svgline.setAttribute("name", line["name"]);
            svgline.setAttribute("title", line["name"]);

            //svg线段坐标
            svgline.setAttribute("x1", line["x1"]);
            svgline.setAttribute("y1", line["y1"]);
            svgline.setAttribute("x2", line["x2"]);
            svgline.setAttribute("y2", line["y2"]);

            //svg线段样式
            svgline.setAttribute("stroke-linejoin", "round");
            svgline.setAttribute("stroke-linecap", "round");
            svgline.setAttribute("stroke", subData["color"]);
            svgline.setAttribute("stroke-width", 4);

            //站点重合
            //if (a["rp"] === "true" && b["rp"] === "true") {
            //    svgline.setAttribute("stroke-width", 2);
            //}


            //showline 线路筛选
            if (showNum && showNum != nowLine) {
                svgline.setAttribute("class", "");
                svgline.setAttribute("opacity", "0.1");

            }
            //控制showline时,之前变窄的线恢复正常
            else if (showNum && showNum == nowLine) {
                svgline.setAttribute("stroke-width", 5);
            }

            //没有或者等于当前showline
            else {
                svgline.setAttribute("opacity", "1");
            }


            //未开通段
            if (line["isOpen"] == 0) {

                svgline.setAttribute("stroke", "#B3B3B3");

            }
            me.svg.appendChild(svgline);
        }

    },
    _createCircle: function (a, color) {
        var me = this,
            showNum = me.options.num,
            nowLine = me.nowLine;
        if (showNum) {
            if (a["slb"] == "false") return;

        }
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        //⚪线路名、样式、name、title
        circle.setAttribute("line", nowLine);
        circle.setAttribute("class", "showline");
        circle.setAttribute("name", a["name"]);
        circle.setAttribute("title", a["name"]);

        //svg 站点⚪属性
        circle.setAttribute("fill", "white");
        circle.setAttribute("stroke", color);
        circle.setAttribute("cx", a["x"]);
        circle.setAttribute("cy", a["y"]);
        circle.setAttribute("r", 4);
        circle.setAttribute("width", 2);

        //showline
        if (showNum && showNum != nowLine) {
            circle.setAttribute("class", "");
            circle.setAttribute("opacity", "0.1");
        } else {
            circle.setAttribute("opacity", "1");
        }

        //是否开通。配置颜色区别 未开通#B3B3B3
        if (a["isOpen"] == 0) {
            circle.setAttribute("stroke", "#B3B3B3");
        }


        me.svg.appendChild(circle);

    },
    _createText: function (a) {
        var me = this,
            showNum = me.options.num,
            nowLine = me.nowLine;
        if (!showNum) {
            if (a["slb"] == "false" || a["rp"] == "true") return;

        }
        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        //文本线路名、文本样式、name、title
        text.setAttribute("line", nowLine);
        text.setAttribute("class", "showline");
        text.setAttribute("name", a["name"]);
        text.setAttribute("title", a["name"]);

        //文本坐标 
        text.setAttribute("x", a["x"] + parseInt(a["rx"]));
        text.setAttribute("y", a["y"] + parseInt(a["ry"]));
        //文本名
        text.textContent = a["name"];

        //showline
        if (showNum && showNum != nowLine) {
            text.setAttribute("class", "");
            text.setAttribute("opacity", "0.1");
        } else {
            text.setAttribute("opacity", "1");
        }


        me.svg.appendChild(text);
    },
    _createImage: function (a) {

        var me = this,
            showNum = me.options.num,
            nowLine = me.nowLine;

        //showline 不现实重合图标
        if (showNum) {
            return
        };

        if (a["rp"]) {

            img = document.createElementNS('http://www.w3.org/2000/svg', 'image');

            img.setAttribute("line", nowLine);
            img.setAttribute("class", "showline images");
            img.setAttribute("name", a["name"]);
            img.setAttribute("title", a["name"]);

            img.setAttribute("x", (a["x"]) - 4.5);
            img.setAttribute("y", (a["y"]) - 4.5);
            img.setAttribute("href", "./turn.png");
            img.setAttribute("width", "9px");
            img.setAttribute("height", "9px");

            me.svg.appendChild(img);

        }
    },
    //按钮
    _renderLinesWrap: function (btns) {

        var me = this;
        if (me.options.showBtns == 0) return;

        var wrap = document.createElement("div");
        wrap.className = "lines-wrap"

        var line_up = document.createElement("div");
        line_up.className = "power-lines-up";

        var img = document.createElement("img");
        img.src = "./arrow_up.png";
        line_up.appendChild(img);

        var line_btns = document.createElement("div");
        line_btns.className = "metro-btn  power-lines-btns"


        for (var i = 0; i < btns.length; i++) {

            var btn = document.createElement("div");
            btn.style.backgroundColor = btns[i]["color"];
            btn.className = "metro-btn";
            btn.innerText = btns[i].name;
            $(btn).attr("onclick", "showSub(" + (i + 1) + ")");

            line_btns.appendChild(btn);

        }

        var line_down = document.createElement("div");
        line_down.className = "power-lines-down"

        var img = document.createElement("img");
        img.src = "./arrow_down.png";
        line_down.appendChild(img);

        var all_btn = document.createElement("div");
        all_btn.className = "metro-btn";
        all_btn.innerText = "全部";
        $(all_btn).attr("onclick", "showSub(null)");

        wrap.appendChild(line_up);
        wrap.appendChild(line_btns);
        wrap.appendChild(line_down);
        wrap.appendChild(all_btn);

        me.element.append(wrap);

    },
    getGuidByName: function (name, type) {
        var me = this;
        if (type == "line") {
            var datas = me.options.data.lines;
        } else {
            var datas = me.options.data.sites;
        }

        var da;
        for (var i = 0; i < datas.length; i++) {
            var data = datas[i];
            if (data.name == name) {
                da = data;
                break;
            }
        }
        return da.wbs_guid;
    }

}