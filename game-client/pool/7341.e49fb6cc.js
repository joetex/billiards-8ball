(self["webpackChunkbloob_io_frontend"] = self["webpackChunkbloob_io_frontend"] || []).push([
    [7341], {
        19385: (t, e, i) => {
            "use strict";
            i.d(e, {
                A: () => c
            });
            var s = function() {
                    var t = this,
                        e = t._self._c;
                    return e("span", {
                        staticClass: "key-bind",
                        class: {
                            "key-bind--active": !t.disabled && t.isActive,
                            "key-bind--partial": !t.disabled && t.isPartial,
                            "key-bind--disabled": t.disabled
                        }
                    }, [t._t("default", (function() {
                        return [e("span", {
                            domProps: {
                                textContent: t._s(t.keys.join(""))
                            }
                        })]
                    }))], 2)
                },
                a = [],
                o = i(48353);
            const n = {
                    data() {
                        return {
                            isActive: !1,
                            isPartial: !1
                        }
                    },
                    props: {
                        keys: {
                            type: Array,
                            required: !0
                        },
                        disabled: {
                            type: Boolean,
                            required: !1
                        }
                    },
                    methods: {
                        keyCheck() {
                            if (0 === this.keys.length) return;
                            const t = (0, o.isSelectedActiveKeys)(this.keys);
                            this.isPartial = !t && (0, o.isPartialActiveKeys)(this.keys), t !== this.isActive && (this.isActive = t, this.disabled || this.$emit(this.isActive ? "active" : "inactive"))
                        }
                    },
                    mounted() {
                        this.keyCheck(), (0, o.addActiveKeysListener)(this.keyCheck)
                    },
                    beforeDestroy() {
                        (0, o.removeActiveKeysListener)(this.keyCheck)
                    }
                },
                r = n;
            var l = i(81656),
                h = (0, l.A)(r, s, a, !1, null, null, null);
            const c = h.exports
        },
        98058: (t, e, i) => {
            "use strict";
            i.d(e, {
                A: () => st
            });
            i(46831);
            var s = function() {
                    var t = this,
                        e = t._self._c;
                    return e("div", {
                        staticClass: "full no-select no-swipe-listener",
                        class: {
                            turn: t.turn
                        }
                    }, [t.display.touch || !t.view.horizontal || t.view.sideControls ? e("div", {
                        staticClass: "pool-player-list-wrapper pool-touch",
                        class: {
                            vertical: t.view.sideControls,
                            "pool-vertical-field": !t.view.horizontal
                        }
                    }, [e("div", {
                        staticClass: "pool-player-list"
                    }, [e("div", {
                        staticClass: "pool-rack-wrapper"
                    }, [e("pool-ball-rack", {
                        attrs: {
                            "is-self": !0,
                            turn: t.self.id === t.turnId,
                            user: t.self,
                            group: t.self.data.group ?? t.group,
                            pocketed: t.pocketed,
                            "game-type": t.gameType,
                            points: t.self.data.points
                        }
                    }, [t._t("rack-slot-self")], 2), t.opponents && t.opponents.length ? e("div", {
                        staticClass: "pool-ball-rack-wrapper"
                    }, [e("user-count", {
                        attrs: {
                            max: 4,
                            "game-users": t.users,
                            users: t.opponents.map((t => t.id)),
                            large: !0,
                            "highlight-user": t.turnId
                        }
                    })], 1) : e("pool-ball-rack", {
                        attrs: {
                            turn: t.opponent.id === t.turnId,
                            user: t.opponent,
                            group: t.opponent.data.group ?? t.group,
                            pocketed: t.pocketed,
                            "game-type": t.gameType,
                            points: t.opponent.data.points
                        }
                    }, [t._t("rack-slot-opponent")], 2)], 1), e("spin-selector", {
                        attrs: {
                            scale: t.scale,
                            selectable: t.turn,
                            selecting: t.selectingSpinPoint,
                            point: t.spinPoint
                        },
                        on: {
                            update: t.updateSpinPoint,
                            open: t.openSpinPointSelector,
                            close: t.closeSpinPointSelector
                        }
                    })], 1)]) : e("div", {
                        staticClass: "pool-player-list-wrapper"
                    }, [e("div", {
                        staticClass: "pool-player-list"
                    }, [e("pool-ball-rack", {
                        attrs: {
                            "is-self": !0,
                            turn: t.self.id === t.turnId,
                            user: t.self,
                            group: t.self.data.group ?? t.group,
                            pocketed: t.pocketed,
                            "game-type": t.gameType,
                            points: t.self.data.points
                        }
                    }, [t._t("rack-slot-self")], 2), e("div", {
                        staticStyle: {
                            height: "75px"
                        }
                    }), e("spin-selector", {
                        attrs: {
                            scale: t.scale,
                            selectable: t.turn,
                            selecting: t.selectingSpinPoint,
                            point: t.spinPoint
                        },
                        on: {
                            update: t.updateSpinPoint,
                            open: t.openSpinPointSelector,
                            close: t.closeSpinPointSelector
                        }
                    }), t.opponents && t.opponents.length ? e("div", {
                        staticClass: "pool-ball-rack-wrapper"
                    }, [e("user-count", {
                        attrs: {
                            max: 4,
                            "game-users": t.users,
                            users: t.opponents.map((t => t.id)),
                            large: !0,
                            "highlight-user": t.turnId
                        }
                    })], 1) : e("pool-ball-rack", {
                        attrs: {
                            turn: t.opponent.id === t.turnId,
                            user: t.opponent,
                            group: t.opponent.data.group ?? t.group,
                            pocketed: t.pocketed,
                            flipped: !0,
                            "game-type": t.gameType,
                            points: t.opponent.data.points
                        }
                    }, [t._t("rack-slot-opponent")], 2)], 1)]), t.display.touch ? e("div", {
                        staticClass: "pool-player-list-wrapper pool-touch",
                        class: {
                            "pool-wrapper-center": t.view.sideControls,
                            "pool-vertical-launcher": !t.view.horizontal
                        }
                    }, [e("div", {
                        staticClass: "pool-launcher-wrapper"
                    }, [e("div", {
                        ref: "launcher",
                        staticClass: "pool-launcher",
                        class: {
                            vertical: !t.view.horizontal || t.view.sideControls
                        },
                        on: {
                            touchstart: t.startPull,
                            mousedown: t.startPull
                        }
                    }, [e("div", {
                        staticClass: "pool-pull-animation"
                    }, [t.firstTime.hit ? t._e() : e("font-awesome-icon", {
                        staticClass: "pull-arrow",
                        attrs: {
                            icon: "arrow-down"
                        }
                    })], 1), e("div", {
                        staticClass: "pool-progress",
                        class: {
                            instant: t.pull.active
                        }
                    }), e("div", {
                        staticClass: "pool-fill-progress",
                        style: {
                            [!t.view.horizontal || t.view.sideControls ? "height" : "width"]: (t.pull.active ? 100 - 100 * t.pull.power : 100) + "%"
                        }
                    })])])]) : t._e(), e("div", {
                        ref: "renderer",
                        staticClass: "full no-select",
                        class: {
                            "pool-can-pull": t.turn,
                            "pool-pulling": t.pull.active || t.draggingBall.active
                        }
                    }, [t.$loaded.poolTextures || !t.loadError || t.firstTime.hit || t.display.mobile || t.view.sideControls || !t.turn || t.display.touch || t.draggingBall.active ? t._e() : e("div", {
                        staticClass: "pool-mouse-pull-animation",
                        style: {
                            top: `${t.draggingBall.position.top}px`,
                            left: `${t.draggingBall.position.left}px`,
                            transform: `rotate(${t.animationAngle}deg)`
                        }
                    }, [e("div", {
                        staticClass: "pull-mouse"
                    }, [e("font-awesome-icon", {
                        style: {
                            transform: `rotate(-${t.animationAngle}deg)`
                        },
                        attrs: {
                            icon: "mouse-pointer"
                        }
                    })], 1)])]), !t.$loaded.poolTextures || t.loadError ? e("div", {
                        staticClass: "full no-select pool-loader"
                    }, [t.$loaded.poolTexturesError || t.loadError ? e("error-message", {
                        attrs: {
                            description: t.$t("error.game.loading"),
                            error: t.$loaded.poolTexturesError ? "resource_load_error" : t.loadError
                        }
                    }) : e("loading-ellipsis")], 1) : t._e()])
                },
                a = [],
                o = i(70580),
                n = i.n(o),
                r = (i(86323), i(99849), i(26210), i(51177), i(45512)),
                l = i(57011),
                h = (i(18315), i(44954)),
                c = i(92014),
                d = i(72101),
                p = i.n(d),
                u = i(16825),
                g = i.n(u),
                f = i(13500),
                m = i.n(f);
            class y {
                constructor({
                    config: t,
                    ballRadius: e,
                    textures: i,
                    wrapper: s,
                    depth: a,
                    holes: o,
                    gameType: n
                }) {
                    this.config = t, this.ballRadius = e, this.textures = i, this.wrapper = s, this.depth = a, this.holes = o, this.gameType = n, this._generatedTextures = [], this.materials = {
                        ["field.green"]: new r.V9B({
                            map: this.textures["field.green"],
                            transparent: !0,
                            depthWrite: !1
                        }),
                        ["field.greenCorner"]: new r.V9B({
                            map: this.textures["field.greenCorner"],
                            transparent: !0,
                            depthWrite: !1
                        }),
                        ["field.holeCorner"]: new r.V9B({
                            map: this.textures["field.holeCorner"],
                            transparent: !0,
                            depthWrite: !1
                        }),
                        ["field.holeCenter"]: new r.V9B({
                            map: this.textures["field.holeCenter"],
                            transparent: !0,
                            depthWrite: !1
                        }),
                        ["field.greenCenter"]: new r.V9B({
                            map: this.textures["field.greenCenter"],
                            transparent: !0,
                            depthWrite: !1
                        }),
                        ["cushion.center"]: new r.V9B({
                            color: 16777215,
                            map: this.textures["field.cushionCenter"],
                            transparent: !0
                        }),
                        ["cushion.centerShadow"]: new r.V9B({
                            color: 0,
                            map: this.textures["field.cushionCenterShadow"],
                            depthWrite: !1,
                            opacity: .3,
                            transparent: !0
                        }),
                        ["cushion.cornerHalf"]: new r.V9B({
                            color: 16777215,
                            map: this.textures["field.cushionCornerHalf"],
                            transparent: !0
                        }),
                        ["cushion.cornerSharp"]: new r.V9B({
                            color: 16777215,
                            map: this.textures["field.cushionCornerSharp"],
                            transparent: !0
                        }),
                        ["cushion.cornerHalfShadow"]: new r.V9B({
                            color: 0,
                            map: this.textures["field.cushionCornerHalfShadow"],
                            depthWrite: !1,
                            opacity: .3,
                            transparent: !0
                        }),
                        ["cushion.cornerSharpShadow"]: new r.V9B({
                            color: 0,
                            map: this.textures["field.cushionCornerSharpShadow"],
                            depthWrite: !1,
                            opacity: .3,
                            transparent: !0
                        }),
                        ["wallDecoration"]: new r.V9B({
                            color: 16777215,
                            opacity: .75,
                            transparent: !0
                        }),
                        ["hole.marker"]: new r.V9B({
                            color: 16711680
                        })
                    };
                    const l = this._createRectFeatherAlphaMap();
                    l && (this.materials["field.underShadow"] = new r.V9B({
                        color: 0,
                        alphaMap: l,
                        depthWrite: !1,
                        transparent: !0,
                        opacity: .25
                    })), this._geometryCache = {}, this.floorBreakLine = {
                        material: void 0,
                        group: void 0
                    }
                }
                _getPlaneGeometry(t, e) {
                    const i = `plane_${t}_${e}`;
                    return this._geometryCache[i] || (this._geometryCache[i] = new r.bdM(t, e)), this._geometryCache[i]
                }
                _getCircleGeometry(t, e) {
                    const i = `circle_${t}_${e}`;
                    return this._geometryCache[i] || (this._geometryCache[i] = new r.tcD(t, e)), this._geometryCache[i]
                }
                _getOctahedronGeometry(t, e) {
                    const i = `oct_${t}_${e}`;
                    return this._geometryCache[i] || (this._geometryCache[i] = new r.Ufg(t, e)), this._geometryCache[i]
                }
                _createRectFeatherAlphaMap() {
                    if ("undefined" === typeof document) return null;
                    const t = 256,
                        e = document.createElement("canvas");
                    e.width = t, e.height = t;
                    const i = e.getContext("2d");
                    if (!i) return null;
                    const s = i.createImageData(t, t),
                        a = s.data,
                        o = .05,
                        n = .11;
                    for (let r = 0; r < t; r++)
                        for (let e = 0; e < t; e++) {
                            const i = (e + .5) / t * 2 - 1,
                                s = (r + .5) / t * 2 - 1,
                                l = 1 - n,
                                h = Math.abs(i) - l,
                                c = Math.abs(s) - l,
                                d = Math.max(h, 0),
                                p = Math.max(c, 0),
                                u = Math.hypot(d, p),
                                g = Math.min(Math.max(h, c), 0),
                                f = u + g - n,
                                m = Math.max(0, Math.min(-f / o, 1)),
                                y = m * m * (3 - 2 * m),
                                v = Math.round(255 * y),
                                b = 4 * (r * t + e);
                            a[b] = v, a[b + 1] = v, a[b + 2] = v, a[b + 3] = 255
                        }
                    i.putImageData(s, 0, 0);
                    const l = new r.GOR(e);
                    return l.needsUpdate = !0, this._generatedTextures.push(l), l
                }
                init() {
                    for (const t of this.config.walls) this.addWall(t);
                    for (const t of this.config.wallDecorations) this.addWallDecoration(t);
                    for (const t of this.config.wallHoles) switch (t.type) {
                        case "corner":
                            this.addHoleCorner(t);
                            break;
                        case "center":
                            this.addHoleCenter(t);
                            break;
                        default:
                            break
                    }
                    for (const t of this.config.cushions) this.addCushion(t);
                    for (const t of this.config.holes) this.addHole(t);
                    this.addFloor({
                        size: this.config.size
                    }), this.addFloorBreakLine()
                }
                addHole({
                    id: t,
                    x: e,
                    y: i,
                    angle: s
                }) {
                    const a = 11,
                        o = this._getCircleGeometry(a, 32),
                        n = new r.eaF(o, this.materials["hole.marker"]);
                    n.position.set(e, i, 0), n.visible = !1, this.holes[t] = {
                        object: n,
                        x: e,
                        y: i,
                        angle: s
                    }, this.wrapper.add(this.holes[t].object)
                }
                addFloor({
                    size: t = 32
                } = {}) {
                    const e = {
                            width: this.config.width + t,
                            height: this.config.height + t
                        },
                        i = this._getPlaneGeometry(e.width, e.height),
                        s = () => {
                            if (!this.materials["field.underShadow"]) return;
                            const t = 2 * this.config.size,
                                i = {
                                    width: e.width + t + 11,
                                    height: e.height + t + 11
                                },
                                s = this._getPlaneGeometry(i.width, i.height),
                                a = new r.eaF(s, this.materials["field.underShadow"]);
                            a.position.set(0, 0, this.depth.floor - .4), this.wrapper.add(a)
                        },
                        a = () => {
                            const s = this.textures["field.green"].clone();
                            s.wrapS = r.GJx, s.wrapT = r.GJx, s.repeat.set(e.width / t, e.height / t), s.needsUpdate = !0;
                            const a = new r.V9B({
                                    color: 16777215,
                                    map: s
                                }),
                                o = new r.eaF(i, a);
                            o.position.set(0, 0, this.depth.floor), this.wrapper.add(o)
                        },
                        o = () => {
                            const t = new r.V9B({
                                    color: 16777215,
                                    alphaMap: this.textures["effect.light"],
                                    depthWrite: !1,
                                    transparent: !0,
                                    opacity: .17
                                }),
                                e = new r.eaF(i, t);
                            e.position.set(0, 0, -.5), this.wrapper.add(e)
                        },
                        n = () => {
                            const t = new r.V9B({
                                    color: 16777215,
                                    alphaMap: this.textures["effect.noise"],
                                    depthWrite: !1,
                                    transparent: !0,
                                    opacity: .1
                                }),
                                e = new r.eaF(i, t);
                            e.position.set(0, 0, -.6), this.wrapper.add(e)
                        };
                    s(), a(), o(), n()
                }
                addFloorBreakLine() {
                    const t = 2,
                        e = new r.V9B({
                            color: 16777215,
                            transparent: !0,
                            opacity: .2
                        }),
                        i = new r.YJl;
                    i.rotation.z = Math.PI / 2;
                    const s = this._getPlaneGeometry(this.config.height, t),
                        a = new r.eaF(s, e);
                    if (i.add(a), this.gameType === m().SNOOKER) {
                        const s = 60,
                            a = 40,
                            o = Math.PI / a,
                            n = .3 * -this.config.width,
                            l = this._getPlaneGeometry(t, s / (a / 3.2));
                        for (let d = 0; d < a; d++) {
                            const a = o / 2 + d * o,
                                n = s * Math.cos(a),
                                h = s * Math.sin(a),
                                c = new r.eaF(l, e);
                            c.position.set(n, h, 0), c.rotation.z = a, c.position.x += t / 2 * Math.cos(a), c.position.y += t / 2 * Math.sin(a), i.add(c)
                        }
                        const h = this._getCircleGeometry(2, 5),
                            c = [{
                                x: 0,
                                y: 0
                            }, {
                                x: 0,
                                y: n
                            }, {
                                x: s,
                                y: n
                            }, {
                                x: -s,
                                y: n
                            }, {
                                x: 0,
                                y: this.config.width / 2 - 55
                            }, {
                                x: 0,
                                y: this.config.width / 5 - 2 * this.ballRadius * .9
                            }];
                        for (const t of c) {
                            const s = new r.eaF(h, e);
                            s.position.x = t.x, s.position.y = n - t.y, i.add(s)
                        }
                        i.position.set(n, 0, this.depth.holeFloor)
                    } else i.position.set(-this.config.width / 4, 0, this.depth.holeFloor);
                    this.wrapper.add(i), this.floorBreakLine = {
                        material: e,
                        group: i
                    }
                }
                addCushion({
                    width: t = 32,
                    size: e = 32,
                    rotation: i = 0,
                    x: s = 0,
                    y: a = 0,
                    left: o,
                    right: n
                } = {}) {
                    const l = new r.YJl;
                    l.position.set(s, a, 0), l.rotation.z = -i;
                    const h = {
                            small: e / 16,
                            normal: e
                        },
                        c = -h.normal / 4;
                    t -= e / 9;
                    const d = this._getPlaneGeometry(t, h.normal),
                        p = this._getPlaneGeometry(h.normal, h.normal),
                        u = () => {
                            const t = new r.eaF(d, this.materials["cushion.center"]);
                            t.position.set(0, c, this.depth.cushion), l.add(t)
                        },
                        g = () => {
                            const t = new r.eaF(d, this.materials["cushion.centerShadow"]);
                            t.userData.type = "shadow", t.position.set(0, c, this.depth.holeFloor + 1), l.add(t)
                        },
                        f = (e, i) => {
                            const s = "left" === i,
                                a = this.materials["cornerHalf" === e ? "cushion.cornerHalf" : "cushion.cornerSharp"],
                                o = new r.eaF(p, a);
                            o.scale.x = s ? -1 : 1, o.position.set((s ? -1 : 1) * (t / 2 + h.normal / 2), c, this.depth.cushion), l.add(o)
                        },
                        m = (e, i) => {
                            const s = "left" === i,
                                a = this.materials["cornerHalf" === e ? "cushion.cornerHalfShadow" : "cushion.cornerSharpShadow"],
                                o = new r.eaF(p, a);
                            o.scale.x = s ? -1 : 1, o.userData.type = "shadow", o.position.set((s ? -1 : 1) * (t / 2 + h.normal / 2), c, this.depth.holeFloor + 1), l.add(o)
                        };
                    u(), f(o, "left"), f(n, "right"), g(), m(o, "left"), m(n, "right"), this.wrapper.add(l)
                }
                addWall({
                    width: t = 32,
                    size: e = 32,
                    rotation: i = 0,
                    x: s = 0,
                    y: a = 0
                } = {}) {
                    const o = new r.YJl;
                    o.position.set(s, a, 0), o.rotation.z = -i;
                    const n = this.textures["field.woodMiddle"].clone();
                    n.wrapS = r.GJx, n.repeat.set(t / e, 1), n.needsUpdate = !0;
                    const l = this._getPlaneGeometry(t, e),
                        h = new r.V9B({
                            color: 16777215,
                            map: n
                        }),
                        c = new r.eaF(l, h);
                    c.position.set(0, 0, this.depth.wood), o.add(c), this.wrapper.add(o)
                }
                addWallDecoration({
                    size: t = 32,
                    x: e = 0,
                    y: i = 0
                } = {}) {
                    const s = this._getOctahedronGeometry(.12 * t, 0),
                        a = new r.eaF(s, this.materials["wallDecoration"]);
                    a.position.set(e, i, 11), this.wrapper.add(a)
                }
                addHoleCenter({
                    size: t = 32,
                    rotation: e = 0,
                    x: i = 0,
                    y: s = 0
                } = {}) {
                    const a = new r.YJl;
                    a.position.set(i, s, 0), a.rotation.z = e;
                    const o = t / 2,
                        n = 2 * t,
                        l = this._getPlaneGeometry(n, n),
                        h = () => {
                            const t = new r.eaF(l, this.materials["field.holeCenter"]);
                            t.position.set(0, -o, this.depth.hole), a.add(t)
                        },
                        c = () => {
                            const t = new r.eaF(l, this.materials["field.greenCenter"]);
                            t.position.set(0, -o, this.depth.holeFloor), a.add(t)
                        },
                        d = () => {
                            const t = new r.eaF(l, this.materials["field.green"]);
                            t.position.set(0, -o - n, this.depth.holeFloor), a.add(t)
                        };
                    h(), c(), d(), this.wrapper.add(a)
                }
                addHoleCorner({
                    size: t = 32,
                    rotation: e = 0,
                    x: i = 0,
                    y: s = 0
                } = {}) {
                    const a = new r.YJl;
                    a.position.set(i, s, 0), a.rotation.z = e;
                    const o = t / 2,
                        n = 2 * t,
                        l = this._getPlaneGeometry(n, n),
                        h = () => {
                            const t = new r.eaF(l, this.materials["field.holeCorner"]);
                            t.position.set(0, -o, this.depth.hole), a.add(t)
                        },
                        c = () => {
                            const t = new r.eaF(l, this.materials["field.greenCorner"]);
                            t.position.set(0, -o, this.depth.holeFloor), a.add(t)
                        },
                        d = () => {
                            const t = new r.eaF(l, this.materials["field.green"]);
                            t.position.set(n, o - n, this.depth.holeFloor), a.add(t);
                            const e = new r.eaF(l, this.materials["field.green"]);
                            e.position.set(n / 2, -o - n, this.depth.holeFloor), a.add(e)
                        };
                    h(), c(), d(), this.wrapper.add(a)
                }
                dispose() {
                    for (const t of this._generatedTextures) t.dispose();
                    this._generatedTextures = [];
                    for (const t in this._geometryCache) this._geometryCache[t].dispose();
                    this._geometryCache = {};
                    for (const t in this.materials) this.materials[t].dispose()
                }
            }
            const v = y;
            var b = i(90601),
                w = i(39501),
                k = i(43653),
                C = i(42953),
                B = i.n(C);
            const _ = !1,
                x = 14473426,
                S = 15158332,
                M = Math.PI / 4;
            class P {
                constructor({
                    domElement: t,
                    config: e,
                    inputConfig: i,
                    fieldConfig: s,
                    groups: a,
                    seed: o,
                    balls: n,
                    textures: l,
                    audio: h,
                    scale: c = 1,
                    horizontal: d = !0,
                    sideControls: p = !1,
                    touchControls: u = !1,
                    preview: g = !0,
                    gameType: f,
                    sleepEventCallback: m
                }) {
                    this.domElement = t, this.sleepEventCallback = m, this.config = e, this.inputConfig = i, this.fieldConfig = s, this.groups = a, this.seed = o, this.playing = !1, this.scale = c, this.horizontal = d, this.preview = g, this.sideControls = p, this.touchControls = u, this.gameType = f, this.ballToGroup = {};
                    for (const r in this.groups)
                        for (const t of this.groups[r]) this.ballToGroup[t] ? this.ballToGroup[t].push(r) : this.ballToGroup[t] = [r];
                    this.$s = {
                        holes: {},
                        balls: {},
                        ballsEffectLayer: {},
                        textures: l,
                        cueStick: void 0,
                        ball: void 0,
                        draggableLayer: void 0,
                        cueDragTarget: void 0
                    };
                    const y = .075;
                    this.calc = {
                        vector: {
                            x: new r.Pq0(1, 0, 0),
                            z: new r.Pq0(0, 0, 1)
                        },
                        checks: [{
                            distance: this.config.ball.radius - y,
                            angle: Math.PI / 2,
                            side: !0
                        }, {
                            distance: 0,
                            angle: 0,
                            side: !1
                        }, {
                            distance: this.config.ball.radius - y,
                            angle: -Math.PI / 2,
                            side: !0
                        }],
                        maxShadowOffset: 2 * this.config.ball.radius * this.config.ball.shadowMaxOffset
                    }, this.audio = h || {
                        presets: () => {}
                    }, this.$m = {
                        scene: void 0,
                        camera: void 0,
                        controls: void 0,
                        renderer: void 0,
                        mouse: new r.I9Y,
                        rayPosition: new r.I9Y,
                        raycaster: new r.tBo,
                        preview: {
                            width: 2,
                            outlineWidth: 4,
                            interface: {
                                object: void 0,
                                objectOutline: void 0,
                                wrapper: void 0,
                                ball: void 0,
                                ballOutline: void 0,
                                ballCrossGroup: void 0,
                                angle: {
                                    width: 3 * this.config.ball.radius,
                                    wrapper: void 0,
                                    self: {
                                        object: void 0,
                                        objectOutline: void 0,
                                        wrapper: void 0
                                    },
                                    target: {
                                        object: void 0,
                                        objectOutline: void 0,
                                        wrapper: void 0
                                    }
                                }
                            },
                            power: {
                                object: void 0,
                                wrapper: void 0,
                                size: this.inputConfig.pull.distance.max
                            }
                        }
                    }, this.animating = !1, this.calculatedGroups = {
                        show: [],
                        hide: []
                    }, this.data = {
                        debug: {},
                        group: void 0,
                        breaking: !0,
                        draggingBall: !1,
                        turn: !1,
                        angle: Math.PI,
                        previewVisible: !1,
                        spinPoint: [0, 0],
                        velocity: 0,
                        pocketing: {},
                        size: {
                            width: 0,
                            height: 0
                        },
                        draggable: {
                            active: !1,
                            areaMaxX: void 0,
                            areaMinX: void 0,
                            areaMaxY: void 0,
                            areaMinY: void 0
                        },
                        intersecting: null,
                        position: new r.Pq0,
                        _target: {
                            pocketing: {},
                            floorBreakLine: {
                                opacity: 0
                            },
                            animateBall: {
                                position: [0, 0]
                            },
                            spinPoint: {
                                value: [0, 0]
                            },
                            highlightBalls: {
                                value: 0,
                                opacity: 0
                            },
                            modifier: {
                                value: 0
                            },
                            velocity: {
                                value: 0
                            },
                            angle: {
                                value: 0
                            },
                            cueStickOpacity: {
                                value: 0
                            }
                        },
                        _current: {
                            pocketing: {},
                            floorBreakLine: {
                                opacity: 0
                            },
                            animateBall: {
                                position: [0, 0]
                            },
                            spinPoint: {
                                value: [0, 0]
                            },
                            highlightBalls: {
                                value: 0,
                                opacity: 0
                            },
                            modifier: {
                                value: 0
                            },
                            velocity: {
                                value: 0
                            },
                            angle: {
                                value: 0
                            },
                            cueStickOpacity: {
                                value: 0
                            }
                        }
                    }, this.field = {
                        wrapper: void 0,
                        depth: {
                            cushion: this.config.ball.radius,
                            wood: 4 * -this.config.ball.radius,
                            hole: -3 * this.config.ball.radius,
                            holeFloor: -1,
                            floor: -5 * this.config.ball.radius
                        }
                    }, this._tween = {}, this._timers = {}, this._fieldAppearance = void 0, this.loopCallback = this.loop.bind(this), this._playback = {
                        active: !1,
                        pending: !1,
                        startTime: 0,
                        intendedStartTime: 0,
                        duration: 0,
                        collisionIndex: 0,
                        pocketIndex: 0,
                        onComplete: null,
                        queuedSync: null
                    }, this._screenCalc = {
                        vector: new r.Pq0,
                        matrix: new r.kn4
                    }, this.materials = {
                        ["line"]: new r.V9B({
                            color: x,
                            transparent: !0,
                            depthWrite: !0,
                            opacity: .95
                        }),
                        ["outline"]: new r.V9B({
                            color: 2899536,
                            transparent: !0,
                            depthWrite: !1,
                            opacity: .65
                        }),
                        ["ball.shadow"]: new r.V9B({
                            color: 0,
                            alphaMap: this.$s.textures["effect.shadow"],
                            depthWrite: !1,
                            transparent: !0
                        }),
                        ["ball.color"]: new r._4j({
                            color: 15158332,
                            metalness: .1,
                            roughness: 0,
                            envMap: this.$s.textures["effect.glossy"]
                        }),
                        ["ball.ball"]: new r._4j({
                            color: 16777215,
                            metalness: .1,
                            roughness: 0,
                            map: this.$s.textures["ball.pool12"],
                            envMap: this.$s.textures["effect.glossy"]
                        }),
                        ["ball.highlightRing"]: new r.V9B({
                            color: 16777215,
                            depthWrite: !1,
                            transparent: !0,
                            opacity: 0
                        })
                    }, this._sharedGeometry = {
                        highlightRing: null,
                        shadow: null,
                        ball: null
                    }, this._rendererSize = null;
                    try {
                        this.init(), this.setBalls(n), this.loop(), this.loadError = !1
                    } catch (v) {
                        console.error("Failed to load the field.", v), this.loadError = v
                    }
                }
                recreate(t, e, i, s) {
                    this.data.intersecting = null, this.createPhysics(), this.setSeed(e), this.setSpeed(i), this.setBalls(t, s)
                }
                destroyPhysics() {
                    this.physics?.destroy(), delete this.physics;
                    const t = Object.keys(this.$s.balls);
                    for (const e of t) {
                        const t = this.$s.balls[e];
                        this.$m.scene.remove(t), t?.geometry?.dispose(), delete this.$s.balls[e]
                    }
                }
                createPhysics() {
                    return this.destroyPhysics(), this.physics = new(g())({
                        p2: p()
                    }, {
                        config: this.config,
                        fieldConfig: this.fieldConfig,
                        seed: this.seed
                    }, {
                        unpocketEvent: ({
                            type: t
                        }) => {
                            this.physicsUnpocket({
                                type: t
                            })
                        }
                    }), this.physics.play(), this.physics
                }
                init() {
                    this.$m.scene = new r.Z58, this.$m.scene.matrixAutoUpdate = !1, this.data.size = this.domElement.getBoundingClientRect();
                    const t = window.devicePixelRatio;
                    this.$m.renderer = new l.JeP({
                        alpha: !0,
                        antialias: !(t > 1),
                        powerPreference: "high-performance"
                    }), this.updatePixelRatio(), this.$m.renderer.toneMapping = r.FV, this.$m.renderer.outputColorSpace = r.er$, this.$m.renderer.setSize(this.data.size.width, this.data.size.height), this.field.wrapper = new r.YJl, this.field.wrapper.rotation.set(-Math.PI / 2, 0, 0), this.$m.scene.add(this.field.wrapper), this.$m.cameraGroup = new r.YJl, this.$m.camera = new r.qUd(this.data.size.width / -2, this.data.size.width / 2, this.data.size.height / 2, this.data.size.height / -2, -100, 100), this.$m.cameraGroup.add(this.$m.camera), this.$m.scene.remove(this.$m.camera), this.$m.scene.add(this.$m.cameraGroup), this.$m.controls = new h.N(this.$m.camera, this.$m.renderer.domElement), this.$m.controls.enabled = !1, this.$m.controls.enablePan = !1, this.$m.controls.enableZoom = !1, this.$m.controls.enableRotate = !1, this.$m.controls.enableDamping = !1;
                    const e = 1e-4;
                    this.$m.controls.minPolarAngle = e, this.$m.controls.maxPolarAngle = e, this.updateCamera(), this.loadField(), this._freezeStaticMeshes(), this.loadLights(), this.loadCueStick(), this.loadBallObject(), this.domElement.appendChild(this.$m.renderer.domElement), this.$m.renderer.compile(this.$m.scene, this.$m.camera), _ && (this.debug_loadHole("hit"), this.debug_loadHole("target"))
                }
                setSeed(t) {
                    this.seed = t, this.physics?.setSeed(t)
                }
                setSpeed(t) {
                    this.speed = t, this.physics?.setSpeed(t)
                }
                setScale(t) {
                    this.scale = t, this.updatePixelRatio()
                }
                updatePixelRatio() {
                    this.$m.renderer.setPixelRatio(Math.ceil(window.devicePixelRatio * this.scale))
                }
                debug_loadHole(t) {
                    const e = new r.rKP(this.config.ball.radius - 3, this.config.ball.radius, 32),
                        i = new r.V9B({
                            color: 16711680,
                            depthWrite: !1,
                            transparent: !0
                        }),
                        s = new r.eaF(e, i);
                    s.rotation.set(-Math.PI / 2, 0, 0), this.$m.scene.add(s), this.data.debug[t] = s
                }
                debug_setHole({
                    name: t,
                    x: e = 0,
                    y: i = 0
                } = {}) {
                    this.data.debug[t] && (this.data.debug[t].position.x = e, this.data.debug[t].position.z = i)
                }
                loadField() {
                    this._fieldAppearance = new v({
                        config: this.fieldConfig,
                        ballRadius: this.config.ball.radius,
                        textures: this.$s.textures,
                        wrapper: this.field.wrapper,
                        depth: this.field.depth,
                        holes: this.$s.holes,
                        gameType: this.gameType
                    }), this._fieldAppearance.init()
                }
                _freezeStaticMeshes() {
                    this.field.wrapper.traverse((t => {
                        t.matrixAutoUpdate = !1, t.updateMatrix(), t.isMesh && (t.frustumCulled = !1)
                    }))
                }
                resize() {
                    this.updateCamera()
                }
                setPreview(t) {
                    this.preview = t
                }
                setSideControls(t = !0) {
                    this.sideControls = t, this.updateCamera()
                }
                setTouchControls(t = !0) {
                    this.touchControls = t, this.updateCamera()
                }
                setHorizontal(t = !0) {
                    this.horizontal = t, this.updateCamera()
                }
                updateCamera() {
                    this.data.size = this.domElement.getBoundingClientRect(), this.$m.renderer.setSize(this.data.size.width, this.data.size.height), this._rendererSize = {
                        width: this.data.size.width,
                        height: this.data.size.height
                    }, this.updatePixelRatio();
                    const t = {
                            width: this.data.size.width,
                            height: this.data.size.height
                        },
                        e = this.fieldConfig.size,
                        i = e / 2,
                        s = {
                            width: this.fieldConfig.width + e,
                            height: this.fieldConfig.height + e
                        },
                        a = this.safeArea || {
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0
                        };
                    a.top -= i, a.bottom += i, a.left -= i, a.right += i;
                    const o = {
                        interfaceOffset: {
                            x: 0,
                            z: 0
                        },
                        modifier: this.fieldConfig.cameraModifier.horizontal,
                        max: 2.5,
                        width: t.width / s.width,
                        height: t.height / s.height
                    };
                    if (this.horizontal)
                        if (this.sideControls) {
                            a.left += 50, a.right += this.touchControls ? 30 : -30;
                            const e = a.left + a.right;
                            o.height = t.height / s.height, o.width = (t.width - e) / s.width, o.modifier = this.fieldConfig.cameraModifier.horizontalSideControls, o.interfaceOffset.x = -a.left, o.interfaceOffset.z = 0, o.max = 2.5
                        } else {
                            a.top = 98;
                            const e = (a.top || 0) + (a.bottom || 0),
                                i = t.height - e;
                            o.height = i / s.height, o.modifier = this.fieldConfig.cameraModifier.horizontal, o.interfaceOffset.z = -((a.top || 0) - (a.bottom || 0))
                        }
                    else {
                        a.right += this.touchControls ? 40 : 0, a.bottom += 75, a.left += 20;
                        const e = a.top + a.bottom,
                            i = a.left + a.right;
                        o.height = (t.height - e) / s.width, o.width = (t.width - i) / s.height, o.modifier = this.fieldConfig.cameraModifier.vertical, o.interfaceOffset.x = -a.bottom, o.interfaceOffset.z = a.right
                    }
                    const n = o.width < o.height ? o.width : o.height,
                        r = n / o.modifier > o.max ? o.max : n / o.modifier;
                    this.$m.camera.left = this.data.size.width / -r, this.$m.camera.right = this.data.size.width / r, this.$m.camera.top = this.data.size.height / r, this.$m.camera.bottom = this.data.size.height / -r;
                    const l = {
                        x: 0 != o.interfaceOffset.x ? o.interfaceOffset.x / r : 0,
                        z: 0 != o.interfaceOffset.z ? o.interfaceOffset.z / r : 0
                    };
                    if (this.$m.camera.position.set(l.x, 1, l.z), this.$m.controls) {
                        this.$m.controls.target.set(l.x, 0, l.z);
                        const t = this.horizontal ? 0 : -Math.PI / 2;
                        this.$m.controls.minAzimuthAngle = t, this.$m.controls.maxAzimuthAngle = t, this.$m.controls.update()
                    } else this.$m.camera.lookAt(l.x, 0, l.z);
                    this.$m.camera.clearViewOffset(), this.$m.camera.updateProjectionMatrix()
                }
                startPlayback(t) {
                    if (!this.physics || !this.physics.frameCount) return this.updateTurn(this.data.turn), t && t(), void(this.sleepEventCallback && this.sleepEventCallback());
                    const e = this.physics.speed || 1,
                        i = performance.now(),
                        s = this._playback.intendedStartTime;
                    this._playback.active = !0, this._playback.startTime = s && s <= i ? s : i, this._playback.intendedStartTime = 0, this._playback.duration = this.physics.getPlaybackDuration() / e, this._playback.collisionIndex = 0, this._playback.pocketIndex = 0, this._playback.onComplete = t || null, this.setPreviewVisibility(!1), this.hideCueStick()
                }
                stopPlayback() {
                    this._playback.active = !1, this._playback.pending = !1, this._playback.intendedStartTime = 0, this._playback.frozenCuePosition = null, this._flushQueuedSync()
                }
                _updatePlayback() {
                    if (!this._playback.active || !this.physics) return;
                    const t = performance.now() - this._playback.startTime,
                        e = Math.min(t / this._playback.duration, 1),
                        i = this.physics.getFrameCount(),
                        s = e * (i - 1),
                        a = this.physics.collisionFrames;
                    while (this._playback.collisionIndex < a.length && a[this._playback.collisionIndex].frame <= s) {
                        const t = a[this._playback.collisionIndex];
                        this._fireCollisionSound(t), this._playback.collisionIndex++
                    }
                    const o = this.physics.pocketFrames;
                    while (this._playback.pocketIndex < o.length && o[this._playback.pocketIndex].frame <= s) {
                        const t = o[this._playback.pocketIndex];
                        this._firePlaybackPocket(t), this._playback.pocketIndex++
                    }
                    const n = this.physics.getFrameAtProgress(e);
                    n && this._renderBalls(n), e >= 1 && (this._playback.active = !1, this._playback.onComplete && this._playback.onComplete(), this.sleepEventCallback && this.sleepEventCallback(), this._flushQueuedSync())
                }
                _queueSync(t, e, i = !1) {
                    this._playback.queuedSync = {
                        type: t,
                        data: JSON.parse(JSON.stringify(e || {})),
                        resetRotation: i
                    }
                }
                _flushQueuedSync() {
                    const t = this._playback.queuedSync;
                    t && (this._playback.queuedSync = null, "setBalls" === t.type ? this._applySetBalls(t.data, t.resetRotation) : "updateBalls" === t.type && this._applyUpdateBalls(t.data, t.resetRotation))
                }
                _fireCollisionSound(t) {
                    const e = this.inputConfig.pull.velocity.max,
                        i = t.velocity > e ? 1 : t.velocity / e;
                    switch (t.type) {
                        case "ball":
                            this.audio.preset("pool_ball_hit", {
                                velocity: i
                            });
                            break;
                        case "cushion":
                            this.audio.preset("pool_ball_hit_cushion", {
                                velocity: i
                            });
                            break;
                        default:
                            break
                    }
                }
                _firePlaybackPocket(t) {
                    const {
                        type: e,
                        id: i,
                        position: s
                    } = t, a = this.$s.holes[i], o = this.$s.balls[e];
                    a && o && (this.data.pocketing[e] = i, this.data._current.pocketing[e] = {
                        position: [...s]
                    }, this.data._target.pocketing[e] = {
                        position: [a.x, a.y]
                    }, this.audio.preset("pool_pocket"), this._tween[`pocketing.${e}`] = new c["default"].Tween(this.data._current.pocketing[e]).to(this.data._target.pocketing[e], 300).easing(c["default"].Easing.Cubic.Out).onStop((() => {
                        this.data.pocketing[e] = !1, o.position.y = 0
                    })).onComplete((() => {
                        const t = 3 * this.config.ball.radius;
                        this.data._current.pocketing[e] = {
                            position: [a.x, a.y]
                        }, this.data._target.pocketing[e] = {
                            position: [a.x + (0, k._fn)(t * Math.cos(a.angle)), a.y + (0, k._fn)(t * Math.sin(a.angle))]
                        }, o.position.y = 2 * -this.config.ball.radius, this._tween[`pocketing.${e}`] = new c["default"].Tween(this.data._current.pocketing[e]).to(this.data._target.pocketing[e], 300).easing(c["default"].Easing.Quadratic.In).onStop((() => {
                            this.data.pocketing[e] = !1, o.position.y = 0
                        })).onComplete((() => {
                            this.data.pocketing[e] = !1, o.position.y = 0
                        })).start()
                    })).start())
                }
                _renderBalls(t) {
                    for (const e in t) {
                        const i = t[e],
                            s = this.$s.balls[e];
                        if (!s) continue;
                        const a = {
                            x: s.position.x,
                            z: s.position.z
                        };
                        this.data.pocketing[e] ? (s.position.x = this.data._current.pocketing[e].position[0], s.position.z = this.data._current.pocketing[e].position[1]) : (s.position.x = i.position[0], s.position.z = i.position[1]);
                        for (const t of s.children) switch (t.userData.type) {
                            case "ball":
                                if (a.x === s.position.x && a.z === s.position.z) break;
                                t.rotateOnWorldAxis(this.calc.vector.z, (a.x - s.position.x) / this.config.ball.radius), t.rotateOnWorldAxis(this.calc.vector.x, -(a.z - s.position.z) / this.config.ball.radius);
                                break;
                            case "shadow": {
                                const e = {
                                    x: s.position.x / (this.fieldConfig.width / 2),
                                    z: s.position.z / (this.fieldConfig.height / 2)
                                };
                                t.position.set(e.x * this.calc.maxShadowOffset, 0, e.z * this.calc.maxShadowOffset);
                                break
                            }
                            default:
                                break
                        }
                    }
                }
                interactUpdate(t) {
                    if (!this.$m.mouse) return;
                    const e = t?.touches?.[0] || t?.changedTouches?.[0],
                        i = e?.clientX ?? t?.clientX ?? t?.pageX,
                        s = e?.clientY ?? t?.clientY ?? t?.pageY;
                    if (!Number.isFinite(i) || !Number.isFinite(s)) return;
                    const a = this.domElement.getBoundingClientRect(),
                        o = Number(this.scale) || 1,
                        n = i / o - a.left,
                        r = s / o - a.top;
                    this.$m.mouse.x = n / this.data.size.width * 2 - 1, this.$m.mouse.y = -r / this.data.size.height * 2 + 1, this.checkIntersection()
                }
                checkIntersection() {
                    this.$m.raycaster.setFromCamera(this.$m.mouse, this.$m.camera);
                    const t = this.getCueDragIntersection();
                    this.$m.rayPosition.x = this.$m.raycaster.ray.origin.x, this.$m.rayPosition.y = this.$m.raycaster.ray.origin.z, this.updateIntersection(t), this.syncCueDragIntersection()
                }
                getCueDragIntersection() {
                    const t = this.$s.draggableLayer,
                        e = this.$s.cueDragTarget;
                    if (!t?.visible || !e) return null;
                    const i = this.$m.raycaster.intersectObject(e, !0)[0];
                    if (i) return i;
                    const s = this.$s.balls?.cue,
                        a = this.$m.raycaster.ray;
                    if (!s || Math.abs(a.direction.y) < 1e-5) return null;
                    const o = -a.origin.y / a.direction.y;
                    if (o < 0) return null;
                    const n = a.origin.x + a.direction.x * o,
                        r = a.origin.z + a.direction.z * o,
                        l = n - s.position.x,
                        h = r - s.position.z,
                        c = 2.1 * this.config.ball.radius;
                    return Math.hypot(l, h) > c ? null : {
                        object: e,
                        point: {
                            x: n,
                            y: 0,
                            z: r
                        },
                        distance: Math.hypot(n - a.origin.x, r - a.origin.z)
                    }
                }
                updateIntersection(t = null) {
                    this.data.intersecting = t
                }
                syncCueDragIntersection(t = !1) {
                    const e = this.$s.cueDragTarget;
                    if (!e?.userData?.intersectCallback) return;
                    const i = this.data.intersecting?.object === e;
                    e.userData.intersectCallback(i, t)
                }
                updateTurn(t) {
                    null != t && (this.data.turn = t), this.data.turn || (this.data.draggingBall = !1), this.animating = !1, this.showCueStick(), this.setPreviewVisibility(this.data.turn, !0), this.checkDraggableLayer()
                }
                renderPhysics() {
                    if (!this.physics) return;
                    if (this._playback.active) return;
                    if (this._playback.pending && this.physics.frameCount) {
                        const t = this.physics.getFrameAtProgress(0);
                        return void(t && this._renderBalls(t))
                    }
                    const t = this.physics.getBalls();
                    t && this._renderBalls(t)
                }
                animateBall({
                    type: t = "cue",
                    position: e
                }) {
                    this._tween["animateBall"]?.stop();
                    const i = this.physics?.balls[t];
                    i && e && null !== e[0] && (this.data._current.animateBall.position = [i.position[0], i.position[1]], this.data._target.animateBall.position = e, this._tween["animateBall"] = new c["default"].Tween(this.data._current.animateBall).to(this.data._target.animateBall, 250).easing(c["default"].Easing.Linear.None).onUpdate((() => {
                        const {
                            x: e,
                            y: i
                        } = this.lookForBallSpot({
                            type: t,
                            x: this.data._current.animateBall.position[0],
                            y: this.data._current.animateBall.position[1]
                        });
                        this.updateBall({
                            type: t,
                            data: {
                                position: [e, i]
                            }
                        })
                    })).onComplete((() => {
                        this.updateBall({
                            type: t,
                            data: {
                                position: this.data._target.animateBall.position
                            }
                        })
                    })).start())
                }
                loadPreviewInterface() {
                    const t = this.$s.balls["cue"];
                    if (!t) return;
                    const e = new r.YJl;
                    e.rotation.set(-Math.PI / 2, 0, 0), this.$m.preview.interface.wrapper = e;
                    const i = new r.YJl;
                    i.userData.isInvalidTarget = !1, this.$m.preview.interface.angle.wrapper = i, e.add(i);
                    const s = 2 * this.config.ball.radius,
                        a = s - .1,
                        o = () => {
                            const t = new r.bdM(1, this.$m.preview.width),
                                i = new r.eaF(t, this.materials["line"]);
                            i.scale.set(100, 1), i.position.x = 50, e.add(i), this.$m.preview.interface.object = i;
                            const s = new r.bdM(1, this.$m.preview.outlineWidth),
                                a = new r.eaF(s, this.materials["outline"]);
                            a.scale.set(100, 1), a.position.x = 50, a.position.z = -.1, e.add(a), this.$m.preview.interface.objectOutline = a
                        },
                        n = () => {
                            const t = this.materials["line"].clone();
                            {
                                const i = new r.rKP(this.config.ball.radius - this.$m.preview.width, this.config.ball.radius, 32),
                                    s = new r.eaF(i, t);
                                s.position.z = 20, s.position.x = -50, e.add(s), this.$m.preview.interface.ball = s;
                                const a = new r.rKP(this.config.ball.radius - 3, this.config.ball.radius + 1, 32),
                                    o = new r.eaF(a, this.materials["outline"]);
                                o.position.z = 19.9, o.position.x = -50, e.add(o), this.$m.preview.interface.ballOutline = o
                            } {
                                const i = new r.YJl;
                                i.position.z = 20, i.position.x = -50, i.visible = !1;
                                const s = 2 * this.config.ball.radius,
                                    a = new r.bdM(s, this.$m.preview.width),
                                    o = new r.eaF(a, t);
                                i.add(o);
                                const n = new r.bdM(s, this.$m.preview.outlineWidth),
                                    l = new r.eaF(n, this.materials["outline"]);
                                l.position.z = -.1, i.add(l), this.$m.preview.interface.ballCrossGroup = i, e.add(i)
                            }
                        },
                        l = t => {
                            const e = new r.YJl;
                            this.$m.preview.interface.angle[t].wrapper = e, this.$m.preview.interface.angle.wrapper.add(e);
                            const i = new r.bdM(1, this.$m.preview.width),
                                o = new r.eaF(i, this.materials["line"]);
                            o.scale.set(20, 1), o.position.x = 10, o.position.z = s, e.add(o), this.$m.preview.interface.angle[t].object = o;
                            const n = new r.bdM(1, this.$m.preview.outlineWidth),
                                l = new r.eaF(n, this.materials["outline"]);
                            l.scale.set(20, 1), l.position.x = 10, l.position.z = a, e.add(l), this.$m.preview.interface.angle[t].objectOutline = l
                        };
                    o(), n(), l("self"), l("target"), t.add(this.$m.preview.interface.wrapper), this.setPreviewVisibility(this.data.previewVisible)
                }
                updatePreviewPower() {
                    const t = this.inputConfig.pull[this.data.breaking ? "breakVelocity" : "velocity"],
                        e = (t.min - this.data.velocity) / (t.min - t.max);
                    this.$m.preview.power.object.scale.set(e, 1, 1), this.$m.preview.power.object.position.set(30 * (1 - e), 0, -10)
                }
                checkIfOutsideDraggable({
                    x: t,
                    y: e
                }) {
                    const {
                        width: i,
                        height: s
                    } = this.fieldConfig;
                    return t > i / 2 || t < -i / 2 || e > s / 2 || e < -s / 2
                }
                updatePreviewLine() {
                    if (!this.preview) return;
                    if (this._playback.pending || this._playback.active) return;
                    const t = this.physics?.balls["cue"];
                    if (!t) return;
                    const e = this.fieldConfig.width + this.fieldConfig.height,
                        i = this.physics?.raycast,
                        s = this.physics?.raycastResult;
                    if (!i || !s) return;
                    let a = !1;
                    const o = {
                        distance: null,
                        body: void 0
                    };
                    for (const c of this.calc.checks) {
                        if (i.from[0] = t.position[0] - (0, k._fn)(c.distance * Math.cos(this.data.angle + c.angle)), i.from[1] = t.position[1] - (0, k._fn)(c.distance * Math.sin(this.data.angle + c.angle)), this.checkIfOutsideDraggable({
                                x: i.from[0],
                                y: i.from[1]
                            }) && (i.from[0] -= (0, k._fn)(this.config.ball.radius * Math.cos(this.data.angle)), i.from[1] -= (0, k._fn)(this.config.ball.radius * Math.sin(this.data.angle)), this.checkIfOutsideDraggable({
                                x: i.from[0],
                                y: i.from[1]
                            }))) {
                            o.distance = 0, o.body = void 0;
                            break
                        }
                        i.to[0] = i.from[0] - (0, k._fn)(e * Math.cos(this.data.angle)), i.to[1] = i.from[1] - (0, k._fn)(e * Math.sin(this.data.angle)), i.update(), s.reset(), this.physics?.world.raycast(s, i);
                        const a = s.getHitDistance(i) + (c.side ? c.distance : 0);
                        (null === o.distance || o.distance > a) && (o.distance = a, o.body = s.body)
                    }
                    const n = this.$m.preview.interface;
                    n.wrapper.rotation.z = -this.data.angle;
                    const r = {
                            start: [t.position[0], t.position[1]],
                            end: [t.position[0] - (0, k._fn)(e * Math.cos(this.data.angle)), t.position[1] - (0, k._fn)(e * Math.sin(this.data.angle))]
                        },
                        l = {
                            start: [],
                            end: [],
                            distance: 0
                        };
                    if (o.body && o.body._type)
                        if (this.$s.balls[o.body._type]) {
                            const i = o.body,
                                s = this.ballToGroup[o.body._type],
                                h = 0 === this.calculatedGroups.show.length,
                                c = this.calculatedGroups.show.some((t => s.includes(t))),
                                d = h || c,
                                p = this.data.angle + Math.PI / 2;
                            l.start = [i.position[0] - (0, k._fn)(e / 2 * Math.cos(p)), i.position[1] - (0, k._fn)(e / 2 * Math.sin(p))], l.end = [i.position[0] + (0, k._fn)(e / 2 * Math.cos(p)), i.position[1] + (0, k._fn)(e / 2 * Math.sin(p))];
                            const u = (0, w.getIntersectingPointOnLines)([r.start, r.end], [l.start, l.end]);
                            if (u) {
                                const e = 2 * this.config.ball.radius,
                                    s = (0, w.getDistance)({
                                        x: u[0],
                                        y: u[1]
                                    }, {
                                        x: i.position[0],
                                        y: i.position[1]
                                    }),
                                    o = Math.sqrt(Math.abs(s * s - e * e)),
                                    r = (0, w.getDistance)({
                                        x: u[0],
                                        y: u[1]
                                    }, {
                                        x: t.position[0],
                                        y: t.position[1]
                                    });
                                l.distance = r - o, n.angle.wrapper.visible = !0, n.angle.wrapper.position.x = -l.distance;
                                const h = Math.acos((s * s + e * e - o * o) / (2 * s * e)),
                                    c = n.angle.wrapper.getWorldPosition(this.data.position),
                                    p = Math.sign((t.position[0] - i.position[0]) * (c.z - i.position[1]) - (t.position[1] - i.position[1]) * (c.x - i.position[0])),
                                    g = t => (t + Math.PI) % (2 * Math.PI),
                                    f = p * g(h);
                                n.angle.self.wrapper.rotation.z = f;
                                const m = Math.abs(f) / (Math.PI / 2) % 1,
                                    y = n.angle.width * (1 - m);
                                n.angle.self.object.scale.set(y, 1), n.angle.self.object.position.x = y / 2, n.angle.self.objectOutline.scale.set(y + .5, 1), n.angle.self.objectOutline.position.x = y / 2 + .5;
                                const v = f + -p * (Math.PI / 2);
                                n.angle.target.wrapper.rotation.z = v;
                                const b = n.angle.width * m;
                                n.angle.target.object.scale.set(b, 1), n.angle.target.object.position.x = e + b / 2, n.angle.target.objectOutline.scale.set(b + 2, 1), n.angle.target.objectOutline.position.x = e + b / 2, a = !d
                            }
                        } else {
                            switch (o.body._type) {
                                case "north":
                                    l.angle = Math.PI / 2, l.start = [e, -this.fieldConfig.height / 2], l.end = [-e, -this.fieldConfig.height / 2];
                                    break;
                                case "south":
                                    l.angle = Math.PI / 2, l.start = [e, this.fieldConfig.height / 2], l.end = [-e, this.fieldConfig.height / 2];
                                    break;
                                case "east":
                                    l.angle = 0, l.start = [this.fieldConfig.width / 2, e], l.end = [this.fieldConfig.width / 2, -e];
                                    break;
                                case "west":
                                    l.angle = 0, l.start = [-this.fieldConfig.width / 2, e], l.end = [-this.fieldConfig.width / 2, -e];
                                    break;
                                default:
                                    return void console.error("Preview line unable to update.", o.body)
                            }
                            const i = (0, w.getIntersectingPointOnLines)([r.start, r.end], [l.start, l.end]);
                            if (i) {
                                const e = this.config.ball.radius,
                                    s = Math.cos(Math.abs(this.data.angle - l.angle)),
                                    a = Math.abs(e / s),
                                    o = (0, w.getDistance)({
                                        x: i[0],
                                        y: i[1]
                                    }, {
                                        x: t.position[0],
                                        y: t.position[1]
                                    });
                                l.distance = o - a, n.angle.wrapper.visible = !1
                            }
                        }
                    else l.distance = 0, n.angle.wrapper.visible = !1;
                    n.ball.position.x = -l.distance, n.ballOutline.position.x = -l.distance, n.ballCrossGroup.position.x = -l.distance, n.ballCrossGroup.rotation.z = this.data.angle + M;
                    const h = l.distance - (a ? this.config.ball.radius : 0);
                    n.object.scale.set(h, 1), n.object.position.x = -h / 2, n.objectOutline.scale.set(h, 1), n.objectOutline.position.x = -h / 2, a ? (n.angle.wrapper.visible = !1, n.angle.wrapper.userData.isInvalidTarget || (n.angle.wrapper.userData.isInvalidTarget = !0, this.$m.preview.interface.ball.material.color.set(S), this.$m.preview.interface.ballCrossGroup.visible = !0)) : !a && n.angle.wrapper.userData.isInvalidTarget && (n.angle.wrapper.userData.isInvalidTarget = !1, this.$m.preview.interface.ball.material.color.set(x), this.$m.preview.interface.ballCrossGroup.visible = !1)
                }
                setDraggable({
                    active: t,
                    circle: e,
                    areaMaxX: i,
                    areaMinX: s,
                    areaMaxY: a,
                    areaMinY: o
                } = {}) {
                    if (this.data.draggable = {
                            active: t,
                            circle: e,
                            areaMaxX: i,
                            areaMinX: s,
                            areaMaxY: a,
                            areaMinY: o
                        }, this.checkDraggableLayer(), this.gameType === m().SNOOKER) return;
                    const n = this.data.breaking && t;
                    this.data._current.floorBreakLine.opacity = this._fieldAppearance.floorBreakLine.material.opacity, this.data._target.floorBreakLine.opacity = n ? .2 : 0, this.data._current.floorBreakLine.opacity !== this.data._target.floorBreakLine.opacity && (this._tween["floorBreakLine"]?.stop(), this._tween["floorBreakLine"] = new c["default"].Tween(this.data._current.floorBreakLine).to(this.data._target.floorBreakLine, 250).easing(c["default"].Easing.Linear.None).onUpdate((() => {
                        this._fieldAppearance && (this._fieldAppearance.floorBreakLine.material.opacity = this.data._current.floorBreakLine.opacity)
                    })).start())
                }
                canDragBall({
                    type: t = "cue"
                }) {
                    if (!this.data.intersecting || this._playback.active || this.data.velocity > 0 || !this.data.draggable.active) return !1;
                    const e = this.data.intersecting.object;
                    return "cue" === t && !0 === e?.userData?.cueDragTarget
                }
                setBallDragging(t = !1) {
                    this.data.draggingBall = t, this.setCueDragHoverCursor(!1), this.data.draggingBall ? (this.hideCueStick({
                        transition: 0
                    }), this.setPreviewVisibility(!1)) : (this.showCueStick(), this.setPreviewVisibility(this.data.turn))
                }
                setGroup(t) {
                    this.data.group = t
                }
                setBreaking(t = !1) {
                    this.data.breaking = t;
                    const e = this.$m.preview.power.object;
                    e.material.color.set(t ? 12597547 : 13849600)
                }
                checkDraggableLayer() {
                    this.$s.draggableLayer && (this.data.turn && this.data.draggingBall || !this.data.draggable.active || this.data.velocity > 0 || this.animating || this._playback.active ? (this.updateIntersection(null), this.$s.draggableLayer.visible = !1, this.syncCueDragIntersection(!0)) : (this.$s.draggableLayer.visible = !0, this.syncCueDragIntersection(!0), this.$m?.mouse && this.checkIntersection()))
                }
                setCueDragHoverCursor(t = !1) {
                    this.domElement?.classList && this.domElement.classList.toggle("pool-can-drag-ball", !!t)
                }
                ballDragMove({
                    type: t = "cue"
                }) {
                    const {
                        x: e,
                        y: i
                    } = this.lookForBallSpot({
                        type: t,
                        x: (0, k._fn)(this.$m.rayPosition.x),
                        y: (0, k._fn)(this.$m.rayPosition.y)
                    }), s = [(0, k._fn)(e), (0, k._fn)(i)];
                    return this.updateBall({
                        type: t,
                        data: {
                            position: s
                        }
                    }), s
                }
                lookForBallSpot({
                    type: t = "cue",
                    x: e,
                    y: i
                }) {
                    if (!this.physics) return {
                        x: (0, k._fn)(e),
                        y: (0, k._fn)(i)
                    };
                    const s = this.config.ball.radius,
                        a = b.DRAG_SAFETY_GAP,
                        o = s + a,
                        n = s + o,
                        r = null != this.data.draggable.areaMaxX ? this.data.draggable.areaMaxX : this.fieldConfig.width / 2,
                        l = null != this.data.draggable.areaMinX ? this.data.draggable.areaMinX : -this.fieldConfig.width / 2,
                        h = null != this.data.draggable.areaMaxY ? this.data.draggable.areaMaxY : this.fieldConfig.height / 2,
                        c = null != this.data.draggable.areaMinY ? this.data.draggable.areaMinY : -this.fieldConfig.height / 2,
                        d = {
                            x: (0, k._fn)(this.physics.balls[t].position[0]),
                            y: (0, k._fn)(this.physics.balls[t].position[1])
                        },
                        p = ({
                            x: t,
                            y: e
                        }) => {
                            let i = t,
                                s = e;
                            if (i > r - o ? i = r - o : i < l + o && (i = l + o), s > h - o ? s = h - o : s < c + o && (s = c + o), this.data.draggable.circle) {
                                const t = this.data.draggable.circle,
                                    e = (0, w.movePositionInCircle)({
                                        x: i,
                                        y: s
                                    }, {
                                        x: t.x,
                                        y: t.y
                                    }, Math.max(t.radius - a, 0));
                                i = e.x, s = e.y
                            }
                            return {
                                x: (0, k._fn)(i),
                                y: (0, k._fn)(s)
                            }
                        },
                        u = ({
                            x: e,
                            y: i
                        }) => {
                            if (this.data.draggable.circle) {
                                const t = (0, w.isOutsideOfCircle)({
                                    x: e,
                                    y: i
                                }, {
                                    x: this.data.draggable.circle.x,
                                    y: this.data.draggable.circle.y
                                }, Math.max(this.data.draggable.circle.radius - a, 0));
                                if (t) return !1
                            }
                            if (e + o > r || e - o < l) return !1;
                            if (i + o > h || i - o < c) return !1;
                            for (const s in this.physics.balls) {
                                if (s === t || this.physics.pocketed?.balls?.[s]) continue;
                                const a = this.physics.balls[s],
                                    o = e - a.position[0],
                                    r = i - a.position[1];
                                if (Math.hypot(o, r) < n) return !1
                            }
                            return !0
                        },
                        g = p({
                            x: e,
                            y: i
                        });
                    if (u(g)) return g;
                    let f = {
                        ...g
                    };
                    for (let y = 0; y < 10; y++) {
                        let e = 0,
                            i = 0,
                            s = 0;
                        for (const a in this.physics.balls) {
                            if (a === t || this.physics.pocketed?.balls?.[a]) continue;
                            const o = this.physics.balls[a],
                                r = f.x - o.position[0],
                                l = f.y - o.position[1],
                                h = Math.hypot(r, l);
                            if (h >= n) continue;
                            s++;
                            const c = n - h;
                            let p = 0,
                                u = 0;
                            if (h > 1e-4) p = r / h, u = l / h;
                            else {
                                const t = f.x - d.x,
                                    e = f.y - d.y,
                                    i = Math.hypot(t, e) || 1;
                                p = t / i, u = e / i
                            }
                            e += p * (c + .01), i += u * (c + .01)
                        }
                        if (!s) break;
                        if (f = p({
                                x: f.x + e,
                                y: f.y + i
                            }), u(f)) return f
                    }
                    let m = {
                        ...d
                    };
                    if (u(d)) {
                        let t = 0,
                            e = 1;
                        for (let i = 0; i < 12; i++) {
                            const i = (t + e) / 2,
                                s = p({
                                    x: d.x + (g.x - d.x) * i,
                                    y: d.y + (g.y - d.y) * i
                                });
                            u(s) ? (m = s, t = i) : e = i
                        }
                    }
                    return {
                        x: (0, k._fn)(m.x),
                        y: (0, k._fn)(m.y)
                    }
                }
                setAngle(t) {
                    const e = !this._playback.active && !this.animating;
                    if (this.data.turn) this.data.angle = t, e && (this.updatePreviewLine(), this.updateCueStick({
                        positionUpdate: !0,
                        angleUpdate: !0
                    }));
                    else {
                        if (this._tween["angleUpdate"]?.stop(), !e) return void(this.data.angle = t);
                        if (Math.abs(this.data.angle - t) > Math.PI) {
                            const e = Math.PI - this.data.angle,
                                i = Math.PI - t,
                                s = e - i,
                                a = Math.abs(s) - 2 * Math.PI;
                            this.data.angle = t - (s > 0 ? a : -a)
                        }
                        this.data._current.angle.value = this.data.angle, this.data._target.angle.value = t, this._tween["angleUpdate"] = new c["default"].Tween(this.data._current.angle).to(this.data._target.angle, 250).easing(c["default"].Easing.Linear.None).onUpdate((() => {
                            this.data.angle = this.data._current.angle.value, this.updateCueStick({
                                positionUpdate: !0,
                                angleUpdate: !0
                            })
                        })).start()
                    }
                }
                setVelocity(t) {
                    const e = !this._playback.active && !this.animating;
                    if (this.data.turn) this.data.velocity = t, e && (this.updateCueStickPull(), this.updatePreviewPower());
                    else {
                        if (this._tween["velocityUpdate"]?.stop(), !e) return this.data.velocity = t, void this.updatePreviewPower();
                        this.data._current.velocity.value = this.data.velocity, this.data._target.velocity.value = t, this._tween["velocityUpdate"] = new c["default"].Tween(this.data._current.velocity).to(this.data._target.velocity, 250).easing(c["default"].Easing.Linear.None).onUpdate((() => {
                            this.data.velocity = this.data._current.velocity.value, this.updateCueStickPull(), this.updatePreviewPower()
                        })).start()
                    }
                }
                updateSpinPoint([t, e] = []) {
                    const i = !this._playback.active && !this.animating;
                    if (this.data.turn) this.data.spinPoint = [t, e], this.updateCueStick({
                        spinUpdate: !0
                    });
                    else {
                        if (this._tween["spinPointUpdate"]?.stop(), !i) return void(this.data.spinPoint = [t, e]);
                        this.data._current.spinPoint.value = this.data.spinPoint, this.data._target.spinPoint.value = [t, e], this._tween["spinPointUpdate"] = new c["default"].Tween(this.data._current.spinPoint).to(this.data._target.spinPoint, 250).easing(c["default"].Easing.Linear.None).onUpdate((() => {
                            this.data.spinPoint = this.data._current.spinPoint.value, this.updateCueStick({
                                spinUpdate: !0
                            })
                        })).start()
                    }
                }
                setPreviewVisibility(t, e = !1) {
                    this.data.previewVisible = t, this.$m.preview.interface.wrapper && (this.$m.preview.interface.wrapper.visible = !!this.preview && t, this.$m.preview.power.wrapper.visible = t, t && (this.updateCalculatedGroups(), this.updatePreviewLine(), this.updatePreviewPower(), clearTimeout(this._timers["highlightBalls"]), this._timers["highlightBalls"] = setTimeout((() => {
                        this.highlightAvailableBalls()
                    }), e ? 500 : 0)))
                }
                getBallPosition({
                    type: t = "cue"
                } = {}) {
                    if (!this.physics?.balls[t]?.position) return [];
                    const e = this.physics.balls[t].position;
                    return [(0, k._fn)(e[0]), (0, k._fn)(e[1])]
                }
                getBallScreenPosition({
                    type: t = "cue"
                } = {}) {
                    if (this.field && this.$s.balls[t]) return this.getScreenPosition(this.$s.balls[t].position)
                }
                getScreenPosition({
                    x: t = 0,
                    y: e = 0,
                    z: i = 0
                }) {
                    const {
                        vector: s,
                        matrix: a
                    } = this._screenCalc;
                    a.makeTranslation(t, e, i), s.setFromMatrixPosition(a), s.project(this.$m.camera);
                    const o = this._rendererSize || this.$m.renderer.domElement.getBoundingClientRect();
                    return s.x = Math.round(s.x * (o.width / 2) + o.width / 2), s.y = Math.round(-s.y * (o.height / 2) + o.height / 2), s
                }
                hitBall(t) {
                    this._tween["cueHit"]?.stop(), this._tween["angleUpdate"]?.stop(), this._tween["velocityUpdate"]?.stop(), this._tween["animateBall"]?.stop(), this.animating = !0, this.data._current.modifier.value = 1, this.data._target.modifier.value = 0, clearTimeout(this._timers["highlightBalls"]), this.highlightAvailableBalls();
                    const e = this.physics?.balls["cue"];
                    this._playback.frozenCuePosition = e ? [e.position[0], e.position[1]] : null, this.physics?.setBreaking(this.data.breaking), this.physics?.hitBall(t), this._playback.pending = !0, this._playback.intendedStartTime = performance.now() + 150, this._tween["cueHit"] = new c["default"].Tween(this.data._current.modifier).to(this.data._target.modifier, 150).easing(c["default"].Easing.Sinusoidal.In).onUpdate((() => {
                        this.updateCueStickPull(this.data._current.modifier.value)
                    })).onComplete((() => {
                        const e = this.inputConfig.pull.velocity.max,
                            i = t.velocity > e ? 1 : t.velocity / e;
                        this.audio.preset("pool_ball_hit_cue", {
                            velocity: i
                        }), this.data.velocity = 0, this.animating = !1, this._playback.pending = !1, this._playback.frozenCuePosition = null, this.startPlayback()
                    })).start()
                }
                cancelHitBall() {
                    this._tween["cueFadeOut"]?.stop(), this._tween["cueHit"]?.stop(), this._tween["angleUpdate"]?.stop(), this._tween["velocityUpdate"]?.stop(), this._tween["animateBall"]?.stop(), this.data.velocity = 0, this.animating = !1, this._playback.pending = !1, this.stopPlayback(), this.showCueStick()
                }
                hideCueStick({
                    transition: t = 350
                } = {}) {
                    const e = this.$s.cueStick.children[0].children[0],
                        i = [e.children[1], e.children[2], e.children[3]],
                        s = e.children[0].children[0];
                    this.data._current.cueStickOpacity.value = 1, this.data._target.cueStickOpacity.value = 0, this._tween["cueFadeOut"] = new c["default"].Tween(this.data._current.cueStickOpacity).to(this.data._target.cueStickOpacity, t).easing(c["default"].Easing.Cubic.Out).onUpdate((() => {
                        i[0].material.opacity = this.data._current.cueStickOpacity.value, i[1].material.opacity = this.data._current.cueStickOpacity.value, i[2].material.opacity = this.data._current.cueStickOpacity.value, s.material.opacity = this.data._current.cueStickOpacity.value
                    })).onComplete((() => {
                        this.data.velocity = 0, this.data.modifier = [0, 0], this.$s.cueStick.visible = !1, i[0].material.opacity = 1, i[1].material.opacity = 1, i[2].material.opacity = 1, s.material.opacity = 1
                    })).start(), this.checkDraggableLayer()
                }
                showCueStick() {
                    this._tween["cueFadeOut"]?.stop();
                    const t = this.$s.cueStick.children[0].children[0],
                        e = [t.children[1], t.children[2], t.children[3]],
                        i = t.children[0].children[0];
                    e[0].material.opacity = 1, e[1].material.opacity = 1, e[2].material.opacity = 1, i.material.opacity = 1, this.$s.cueStick.visible = !0, this.updateCueStick({
                        positionUpdate: !0,
                        angleUpdate: !0,
                        spinUpdate: !0
                    }), this.checkDraggableLayer(), this.data.turn && this.audio.preset("pool_bat_place")
                }
                setBalls(t = {}, e = !1) {
                    this._playback.active || this._playback.pending ? this._queueSync("setBalls", t, e) : this._applySetBalls(t, e)
                }
                _applySetBalls(t = {}, e = !1) {
                    const i = {
                            ...t
                        },
                        s = [];
                    for (const a in i) {
                        const t = i[a];
                        if (this.$s.balls[a]) {
                            const o = this.updateBall({
                                type: a,
                                data: t
                            });
                            delete i[a], o && e && s.push(a)
                        } else s.push(a), this.addBall({
                            type: a,
                            x: t.position[0],
                            y: t.position[1],
                            pocket: t.pocket
                        }), "cue" === a && this.loadPreviewInterface()
                    }
                    s.length > 0 && this.resetBallRotations(s)
                }
                resetBallRotations(t = []) {
                    this.renderPhysics(), requestAnimationFrame((() => {
                        requestAnimationFrame((() => {
                            requestAnimationFrame((() => {
                                for (const e of t)
                                    if ("cue" !== e && this.$s?.balls?.[e]?.children)
                                        for (const t of this.$s.balls[e].children) switch (t.userData.type) {
                                            case "ball":
                                                t.rotation.x = -Math.PI / 2 + (.5 - Math.random()) / 3, t.rotation.y = 0, t.rotation.z = (.5 - Math.random()) / 3;
                                                break;
                                            default:
                                                break
                                        }
                            }))
                        }))
                    }))
                }
                sleep() {
                    this.physics?.sleep()
                }
                updateBalls(t, e = !1) {
                    this._playback.active || this._playback.pending ? this._queueSync("updateBalls", t, e) : this._applyUpdateBalls(t, e)
                }
                _applyUpdateBalls(t, e = !1) {
                    const i = Object.keys(t);
                    this.physics?.updateBalls(t), this.updateCueStick({
                        positionUpdate: !0,
                        angleUpdate: !0,
                        spinUpdate: !0
                    }), this.showCueStick(), e && this.resetBallRotations(Object.keys(i))
                }
                updateBall({
                    type: t,
                    data: e
                }) {
                    if (!this.physics) return !1;
                    const i = this.physics.balls[t]?.position || [0, 0],
                        s = [(0, k._fn)(i[0]), (0, k._fn)(i[1])];
                    return this.physics.updateBall({
                        type: t,
                        data: e
                    }), this.updateCueStick({
                        positionUpdate: !0,
                        angleUpdate: !0,
                        spinUpdate: !0
                    }), e.position[0] !== s[0] || e.position[1] !== s[1]
                }
                loadCueStick() {
                    const t = 300,
                        e = () => {
                            const e = new r.YJl,
                                i = new r.bdM(.15 * t, 1.28 * t),
                                s = new r.V9B({
                                    color: 0,
                                    alphaMap: this.$s.textures["effect.stickShadow"],
                                    depthWrite: !1,
                                    transparent: !0
                                }),
                                o = new r.eaF(i, s);
                            o.userData.type = "shadow", o.position.set(0, -.5 * t, 0), e.add(o), e.position.set(0, 0, -.48 * t), e.rotation.set(-Math.PI / 2, 0, 0), a.model.add(e)
                        },
                        i = () => {
                            const t = {
                                    x: 60,
                                    y: 18
                                },
                                e = new r.YJl,
                                i = new r.bdM(t.x, t.y),
                                s = new r.V9B({
                                    color: 16777215,
                                    map: this.$s.textures["cueStick.powerLevel"],
                                    depthWrite: !1,
                                    transparent: !0
                                }),
                                o = new r.eaF(i, s);
                            o.userData.type = "powerLevel";
                            const n = new r.bdM(t.x, .6 * t.y),
                                l = new r.V9B({
                                    color: 13849600,
                                    depthWrite: !0,
                                    transparent: !1
                                }),
                                h = new r.eaF(n, l);
                            h.userData.type = "powerLevel.fill", e.add(o), e.add(h), e.position.set(20, 10, 55), e.rotation.set(-Math.PI / 2, 0, Math.PI / 2), e.visible = !1, this.$m.preview.power.object = h, this.$m.preview.power.wrapper = e, a.wrapper.add(e)
                        },
                        s = () => {
                            const e = new r.Ho_(1.5, 3.5, t, 8),
                                i = new r.V9B({
                                    color: 16777215,
                                    map: this.$s.textures["cueStick.default"],
                                    transparent: !0
                                }),
                                s = new r.eaF(e, i);
                            s.rotation.set(-Math.PI / 2, 0, 0), a.model.add(s);
                            const o = new r.Ho_(1.5, 1.5, 3, 8),
                                n = new r.V9B({
                                    color: 16777215,
                                    transparent: !0
                                }),
                                l = new r.eaF(o, n);
                            l.position.z = -t / 2 - 1, l.rotation.set(-Math.PI / 2, 0, 0), a.model.add(l);
                            const h = new r.Gu$(3.5, 8),
                                c = new r.V9B({
                                    color: 525827,
                                    transparent: !0
                                }),
                                d = new r.eaF(h, c);
                            d.position.z = t / 2, a.model.add(d)
                        },
                        a = {
                            model: new r.YJl,
                            wrapper: new r.YJl,
                            pull: new r.YJl
                        };
                    e(), s(), a.model.position.set(0, 0, t / 2 + this.config.ball.radius), a.pull.add(a.model), a.pull.position.set(0, 0, 10), a.wrapper.add(a.pull), a.wrapper.position.set(0, 2 * this.config.ball.radius, 0), i(), this.$s.cueStick = a.wrapper, this.$m.scene.add(a.wrapper)
                }
                updateCueStick({
                    positionUpdate: t = !1,
                    angleUpdate: e = !1,
                    spinUpdate: i = !1
                } = {}) {
                    const s = this.$s.cueStick;
                    if (!s) return;
                    const a = this._playback.frozenCuePosition,
                        o = this.physics?.balls["cue"],
                        n = a || (o ? [o.position[0], o.position[1]] : null);
                    if (!n) return;
                    const r = s.children[0];
                    if (t && (s.position.x = n[0], s.position.z = n[1], this.updateCueStickPull()), e) {
                        const t = s.children[0].children[0].children[0],
                            e = Math.PI / 2,
                            i = -this.data.angle + e;
                        s.rotation.set(0, i, 0);
                        const a = Math.atan2(s.position.x, s.position.z);
                        let o = (i - a - Math.PI) / Math.PI;
                        while (Math.abs(o) > .5) o > .5 ? o -= 2 * (o - .5) : o < -.5 && (o -= 2 * (o + .5));
                        const n = .1,
                            r = n * (o / .5);
                        t.rotation.z = r
                    }
                    if (i) {
                        const t = this.data.spinPoint[0] * (this.config.ball.radius - 3);
                        r.position.x = t
                    }
                }
                updateCueStickPull(t = 1) {
                    const e = this.$s.cueStick;
                    if (!e) return;
                    const i = e.children[0],
                        s = this.inputConfig.pull[this.data.breaking ? "breakVelocity" : "velocity"],
                        a = this.inputConfig.pull.distance.max * ((s.min - this.data.velocity) / (s.min - s.max));
                    i.position.z = (10 + a) * t
                }
                loadBallObject() {
                    if (this.$s.ball) return;
                    const t = this.config.ball.radius,
                        e = () => {
                            if (!this._sharedGeometry.shadow) {
                                const e = 2 * t * 2;
                                this._sharedGeometry.shadow = new r.bdM(e, e)
                            }
                            const e = new r.eaF(this._sharedGeometry.shadow, this.materials["ball.shadow"]);
                            e.userData.type = "shadow", e.rotation.set(-Math.PI / 2, 0, 0), e.position.set(0, 0, 0), s.add(e)
                        },
                        i = () => {
                            this._sharedGeometry.ball || (this._sharedGeometry.ball = new r.Gu$(t, 24, 24));
                            const e = new r.eaF(this._sharedGeometry.ball, this.materials["ball.ball"]);
                            e.userData.type = "ball", s.add(e)
                        },
                        s = new r.YJl;
                    e(), i(), this.$s.ball = s
                }
                addBall({
                    type: t = "cue",
                    x: e = 0,
                    y: i = 0,
                    pocket: s = !1
                } = {}) {
                    if (this.$s.balls[t]) return;
                    const a = this.$s.ball.clone();
                    for (const o of a.children) switch (o.userData.type) {
                        case "ball":
                            if (this.$s.textures[`ball.${t}`]) o.material = o.material.clone(), o.material.map = this.$s.textures[`ball.${t}`];
                            else {
                                o.material = this.materials["ball.color"].clone();
                                const e = t.replace(/[0-9]/g, "");
                                switch (e) {
                                    case "red":
                                        o.material.color.set(15158332);
                                        break;
                                    case "yellow":
                                        o.material.color.set(15844367);
                                        break;
                                    case "pink":
                                        o.material.color.set(16095632);
                                        break;
                                    case "blue":
                                        o.material.color.set(3447003);
                                        break;
                                    case "brown":
                                        o.material.color.set(10448414);
                                        break;
                                    case "black":
                                        o.material.color.set(2899536);
                                        break;
                                    case "green":
                                        o.material.color.set(2600544);
                                        break;
                                    case "filler":
                                        o.material = o.material.clone(), o.material.color.set(16777215), o.material.map = this.$s.textures["ball.filler"];
                                        break;
                                    default:
                                        break
                                }
                            }
                            o.material.needsUpdate = !0, "cue" !== t && (o.rotation.x = -Math.PI / 2 + (.5 - Math.random()) / 3, o.rotation.y = 0, o.rotation.z = (.5 - Math.random()) / 3);
                            break;
                        default:
                            break
                    }
                    if (a.position.x = e, a.position.z = i, this.physics?.addBall({
                            type: t,
                            x: e,
                            y: i,
                            pocket: s
                        }), this.$s.balls[t] = a, this.$m.scene.add(a), "cue" === t) {
                        const t = a.children.find((t => "ball" === t.userData?.type));
                        t && (t.userData.cueDragTarget = !0, t.userData.draggable = !0);
                        const e = 4.2 * this.config.ball.radius,
                            i = new r.bdM(e, e),
                            s = new r._4j({
                                color: 16777215,
                                metalness: .1,
                                roughness: 0,
                                map: this.$s.textures["ball.draggable"],
                                depthWrite: !1,
                                transparent: !0,
                                opacity: .5
                            }),
                            o = new r.eaF(i, s);
                        o.rotation.set(-Math.PI / 2, 0, 0), o.position.set(0, 0, 0), t && (t.userData.intersectCallback = (t, e = !1) => {
                            let i = 0;
                            const s = this.data.turn && this.data.draggable.active && this.data.velocity <= 0 && !this.animating && !this._playback.active && !this._playback.pending,
                                a = e && this.data.draggingBall;
                            i = a ? .5 : s && t ? .9 : s ? .5 : 0, o.material.opacity !== i && (o.material.opacity = i, o.material.needsUpdate = !0);
                            const n = t && s && !this.data.draggingBall;
                            this.setCueDragHoverCursor(n)
                        }), this.$s.draggableLayer = o, this.$s.cueDragTarget = t, a.add(this.$s.draggableLayer), this.updateCueStick({
                            positionUpdate: !0,
                            angleUpdate: !0,
                            spinUpdate: !0
                        })
                    } else {
                        if (!this._sharedGeometry.highlightRing) {
                            const t = 3.5 * this.config.ball.radius;
                            this._sharedGeometry.highlightRing = new r.rKP(t - this.config.ball.radius, t, 32)
                        }
                        const e = new r.eaF(this._sharedGeometry.highlightRing, this.materials["ball.highlightRing"]);
                        e.rotation.set(-Math.PI / 2, 0, 0), e.visible = !1, this.$s.ballsEffectLayer[t] = e, a.add(this.$s.ballsEffectLayer[t])
                    }
                }
                hideAllHighlight() {
                    for (const t in this.$s.ballsEffectLayer) this.$s.ballsEffectLayer[t].visible = !1
                }
                updateCalculatedGroups() {
                    const t = {
                        show: [],
                        hide: []
                    };
                    switch (this.gameType) {
                        case m().EIGHT_BALL_POOL: {
                            switch (this.data.group) {
                                case B().SOLID:
                                    t.show.push(B().SOLID), t.hide.push(B().STRIPE);
                                    break;
                                case B().STRIPE:
                                    t.show.push(B().STRIPE), t.hide.push(B().SOLID);
                                    break
                            }
                            let e = 0;
                            for (const i of t.show)
                                for (const t of this.groups[i]) this.physics?.pocketed?.balls?.[t] || e++;
                            0 === e && 0 !== t.hide.length && (t.show = [B().EIGHT_BALL]);
                            break
                        }
                        case m().SNOOKER:
                            switch (this.data.group) {
                                case B().RED:
                                    t.show.push(B().RED), t.hide.push(B().COLOR);
                                    break;
                                case B().COLOR:
                                    t.show.push(B().COLOR), t.hide.push(B().RED);
                                    break;
                                case B().FREE:
                                    break;
                                default:
                                    this.data.group && Array.isArray(this.groups?.[this.data.group]) && (t.show.push(this.data.group), t.hide.push(B().COLOR, B().RED));
                                    break
                            }
                            break;
                        case m().CUTTHROAT_POOL:
                            switch (this.data.group) {
                                case B().RED:
                                    t.hide.push(B().YELLOW, B().BLUE, B().GREEN, B().BLACK), t.show.push(B().RED);
                                    break;
                                case B().YELLOW:
                                    t.hide.push(B().RED, B().BLUE, B().GREEN, B().BLACK), t.show.push(B().YELLOW);
                                    break;
                                case B().BLUE:
                                    t.hide.push(B().RED, B().YELLOW, B().GREEN, B().BLACK), t.show.push(B().BLUE);
                                    break;
                                case B().GREEN:
                                    t.hide.push(B().RED, B().YELLOW, B().BLUE, B().BLACK), t.show.push(B().GREEN);
                                    break;
                                case B().BLACK:
                                    t.hide.push(B().RED, B().YELLOW, B().BLUE, B().GREEN), t.show.push(B().BLACK);
                                    break
                            }
                            break;
                        case m().NINE_BALL_POOL:
                            for (const e of [B().POOL1, B().POOL2, B().POOL3, B().POOL4, B().POOL5, B().POOL6, B().POOL7, B().POOL8, B().POOL9]) e === this.data.group ? t.show.push(e) : t.hide.push(e);
                            break;
                        default:
                            break
                    }
                    this.calculatedGroups = t
                }
                highlightAvailableBalls() {
                    if (clearTimeout(this._timers["highlightBalls"]), this.animating || !this.data.turn) return this.hideAllHighlight();
                    this.updateCalculatedGroups();
                    const t = this.calculatedGroups;
                    if (0 === t.show.length && 0 === t.hide.length) return this.hideAllHighlight();
                    for (const e of t.hide) {
                        const t = this.groups?.[e];
                        if (Array.isArray(t))
                            for (const e of t) this.$s.ballsEffectLayer[e] && (this.$s.ballsEffectLayer[e].visible = !1)
                    }
                    for (const e of t.show) {
                        const t = this.groups?.[e];
                        if (Array.isArray(t))
                            for (const e of t) this.$s.ballsEffectLayer[e] && (this.$s.ballsEffectLayer[e].visible = !0)
                    }
                    this._tween["highlightBalls"]?.stop(), this.data._current.highlightBalls.value = 1, this.data._target.highlightBalls.value = .1, this.data._current.highlightBalls.opacity = .15, this.data._target.highlightBalls.opacity = .6, this._tween["highlightBalls"] = new c["default"].Tween(this.data._current.highlightBalls).to(this.data._target.highlightBalls, 600).easing(c["default"].Easing.Linear.None).onUpdate((() => {
                        const {
                            value: e,
                            opacity: i
                        } = this.data._current.highlightBalls;
                        for (const s of t.show) {
                            const t = this.groups?.[s];
                            if (Array.isArray(t) && 0 !== t.length)
                                for (const s of t) {
                                    const t = this.$s.ballsEffectLayer[s];
                                    t && (t.scale.set(e, e, 1), t.material.opacity = i)
                                }
                        }
                    })).start(), this._timers["highlightBalls"] = setTimeout((() => {
                        this.highlightAvailableBalls()
                    }), 5e3)
                }
                physicsUnpocket({
                    type: t
                }) {
                    this._tween[`pocketing.${t}`]?.stop?.(), this.audio.preset("pool_ball_place")
                }
                loadLights() {
                    const t = new r.dth(16777215, 0, .6);
                    t.matrixAutoUpdate = !1, t.updateMatrix(), this.$m.scene.add(t);
                    const e = .6,
                        i = new r.ure(16777215, e, 1.5 * this.fieldConfig.width, 1.5 * this.fieldConfig.height);
                    i.position.set(0, 100, 0), i.lookAt(0, 0, 0), i.matrixAutoUpdate = !1, i.updateMatrix(), this.$m.scene.add(i)
                }
                loop() {
                    requestAnimationFrame(this.loopCallback), this.$m.renderer && (this._updatePlayback(), this.renderPhysics(), this.$m.renderer?.render(this.$m.scene, this.$m.camera))
                }
                stopAllTweens() {
                    for (const t in this._tween) this._tween[t]?.stop()
                }
                stopAllTimers() {
                    for (const t in this._timers) clearTimeout(this._timers[t])
                }
                destroy() {
                    this.stopPlayback(), this.stopAllTweens(), this.stopAllTimers(), this.physics?.destroy(), this.$m?.controls?.dispose?.(), this.$m?.renderer?.forceContextLoss();
                    for (const t of ["$m", "$s"])
                        for (const e in this[t]) delete this[t][e]
                }
            }
            const E = P;
            var A = i(29701),
                L = i(62476),
                T = i(21444),
                $ = i.n(T),
                I = i(850),
                O = function() {
                    var t = this,
                        e = t._self._c;
                    return e("div", {
                        staticClass: "spin-selector-wrapper",
                        class: {
                            selecting: t.selecting || t.moving.active,
                            selectable: t.selectable,
                            "selecting-by-keyboard": t.moving.active
                        }
                    }, [e("div", {
                        staticClass: "spin-close-background",
                        on: {
                            click: t.close
                        }
                    }), e("div", {
                        ref: "selector",
                        staticClass: "spin-selector",
                        style: t.selectorStyle,
                        on: {
                            touchstart: t.inputDown,
                            mousedown: t.inputDown
                        }
                    }, [e("div", {
                        staticClass: "spin-pointer-wrapper",
                        style: t.pointStyle
                    }, [e("div", {
                        staticClass: "spin-pointer"
                    })]), e("i18n", {
                        staticClass: "spin-selector-hint",
                        attrs: {
                            path: "info.keyboardShortcutSpinSelector",
                            tag: "div"
                        }
                    }, [e("span", {
                        staticClass: "d-flex inline gap-1",
                        attrs: {
                            slot: "keys"
                        },
                        slot: "keys"
                    }, [e("key-bind", {
                        attrs: {
                            disabled: !t.selectable,
                            keys: ["arrowleft"]
                        }
                    }, [e("font-awesome-icon", {
                        attrs: {
                            icon: "fa-arrow-left"
                        }
                    })], 1), e("key-bind", {
                        attrs: {
                            disabled: !t.selectable,
                            keys: ["arrowup"]
                        }
                    }, [e("font-awesome-icon", {
                        attrs: {
                            icon: "fa-arrow-up"
                        }
                    })], 1), e("key-bind", {
                        attrs: {
                            disabled: !t.selectable,
                            keys: ["arrowdown"]
                        }
                    }, [e("font-awesome-icon", {
                        attrs: {
                            icon: "fa-arrow-down"
                        }
                    })], 1), e("key-bind", {
                        attrs: {
                            disabled: !t.selectable,
                            keys: ["arrowright"]
                        }
                    }, [e("font-awesome-icon", {
                        attrs: {
                            icon: "fa-arrow-right"
                        }
                    })], 1)], 1)])], 1)])
                },
                F = [],
                R = i(19385);
            const D = {
                    data() {
                        return {
                            x: 0,
                            y: 0,
                            tween: void 0,
                            keyLoop: void 0,
                            keys: {
                                left: {
                                    active: !1,
                                    list: [37, 65]
                                },
                                right: {
                                    active: !1,
                                    list: [39, 68]
                                },
                                up: {
                                    active: !1,
                                    list: [38, 87]
                                },
                                down: {
                                    active: !1,
                                    list: [40, 83]
                                }
                            },
                            moving: {
                                active: !1,
                                activeKeys: !1,
                                distance: 0,
                                angle: 0,
                                centerThreshold: .08,
                                center: {
                                    x: 0,
                                    y: 0
                                },
                                current: {
                                    x: 0,
                                    y: 0
                                }
                            }
                        }
                    },
                    props: {
                        scale: {
                            type: Number,
                            default: 1
                        },
                        selectable: {
                            type: Boolean,
                            default: !1
                        },
                        selecting: {
                            type: Boolean,
                            default: !1
                        },
                        radius: {
                            type: Number,
                            default: 60
                        },
                        point: {
                            type: Array,
                            default: () => [0, 0]
                        }
                    },
                    components: {
                        KeyBind: R.A
                    },
                    watch: {
                        selectable() {
                            this.selectable ? (window.addEventListener("keydown", this.interactKeyDown), window.addEventListener("keyup", this.interactKeyUp)) : (this.inputUp(), this.forceEndKeyLoop(), window.removeEventListener("keydown", this.interactKeyDown), window.removeEventListener("keyup", this.interactKeyUp))
                        },
                        point() {
                            this.updatePoint()
                        }
                    },
                    created() {
                        this.updatePoint()
                    },
                    computed: {
                        selectorStyle() {
                            return this.selecting || this.moving.active ? {
                                width: 2 * this.radius + "px",
                                height: 2 * this.radius + "px"
                            } : {}
                        },
                        pointStyle() {
                            return {
                                transform: `translate(${50 * this.x}%, ${50 * this.y}%)`
                            }
                        }
                    },
                    beforeDestroy() {
                        this.tween && this.tween.stop(), window.removeEventListener("mousemove", this.interactMove), window.removeEventListener("mouseup", this.inputUp), window.removeEventListener("touchmove", this.interactMove), window.removeEventListener("touchend", this.inputUp), window.removeEventListener("touchcancel", this.inputUp)
                    },
                    methods: {
                        close() {
                            this.$emit("close", !0)
                        },
                        updatePoint() {
                            const [t, e] = this.point, i = {
                                x: this.x,
                                y: this.y
                            }, s = {
                                x: t,
                                y: e
                            };
                            this.tween = new c["default"].Tween(i).to(s, 250).easing(c["default"].Easing.Linear.None).onStop((() => {
                                this.x = t, this.y = e
                            })).onUpdate((() => {
                                this.x = i.x, this.y = i.y
                            })).start()
                        },
                        interactKeyDown(t) {
                            this.keys.left.list.includes(t.keyCode) ? this.keys.left.active = !0 : this.keys.right.list.includes(t.keyCode) ? this.keys.right.active = !0 : this.keys.up.list.includes(t.keyCode) ? this.keys.up.active = !0 : this.keys.down.list.includes(t.keyCode) && (this.keys.down.active = !0), this.checkKeyLoop()
                        },
                        interactKeyUp(t) {
                            this.keys.left.list.includes(t.keyCode) ? this.keys.left.active = !1 : this.keys.right.list.includes(t.keyCode) ? this.keys.right.active = !1 : this.keys.up.list.includes(t.keyCode) ? this.keys.up.active = !1 : this.keys.down.list.includes(t.keyCode) && (this.keys.down.active = !1), this.checkKeyLoop()
                        },
                        forceEndKeyLoop() {
                            this.keys.left.active = !1, this.keys.right.active = !1, this.keys.up.active = !1, this.keys.down.active = !1, this.checkKeyLoop(), this.moving.current.x = 0, this.moving.current.y = 0
                        },
                        checkKeyLoop() {
                            const t = this.keys.left.active || this.keys.right.active || this.keys.up.active || this.keys.down.active;
                            t && !this.moving.activeKeys ? (this.moving.active = !0, this.moving.activeKeys = !0, this.keyLoopAction()) : !t && this.moving.activeKeys && (clearTimeout(this.keyLoop), this.moving.active = !1, this.moving.activeKeys = !1)
                        },
                        keyLoopAction() {
                            this.moving.activeKeys && (this.keys.left.active && (this.moving.current.x -= 1), this.keys.right.active && (this.moving.current.x += 1), this.keys.up.active && (this.moving.current.y -= 1), this.keys.down.active && (this.moving.current.y += 1), this.moving.current.x > this.radius && (this.moving.current.x = this.radius), this.moving.current.x < -this.radius && (this.moving.current.x = -this.radius), this.moving.current.y > this.radius && (this.moving.current.y = this.radius), this.moving.current.y < -this.radius && (this.moving.current.y = -this.radius), this.setDistanceAndAngle(), this.keyLoop = setTimeout(this.keyLoopAction.bind(this), 20))
                        },
                        interactMove(t) {
                            if (t.touches?.length > 1) return void this.inputUp(t);
                            const e = t.changedTouches,
                                i = (e ? e[0].clientX : t.clientX) / this.scale,
                                s = (e ? e[0].clientY : t.clientY) / this.scale;
                            this.moving.current.x = i - this.moving.center.x, this.moving.current.y = s - this.moving.center.y, this.setDistanceAndAngle()
                        },
                        inputDown(t) {
                            if (t?.changedTouches && window.isDeviceZoomed) return;
                            if (!this.selecting) return void(this.selectable && (this.$emit("open", !0), this.tween && this.tween.stop()));
                            if (this.moving.active) return;
                            this.moving.active = !0;
                            const e = this.$refs.selector.getBoundingClientRect();
                            this.moving.center.x = e.left + e.width / 2, this.moving.center.y = e.top + e.height / 2, this.interactMove(t), window.addEventListener("mousemove", this.interactMove), window.addEventListener("mouseup", this.inputUp), window.addEventListener("touchmove", this.interactMove), window.addEventListener("touchend", this.inputUp), window.addEventListener("touchcancel", this.inputUp)
                        },
                        inputUp(t) {
                            this.moving.active && (t && this.interactMove(t), this.moving.active = !1, this.moving.activeKeys = !1, this.moving.center.x = 0, this.moving.center.y = 0, window.removeEventListener("mousemove", this.interactMove), window.removeEventListener("mouseup", this.inputUp), window.removeEventListener("touchmove", this.interactMove), window.removeEventListener("touchend", this.inputUp), window.removeEventListener("touchcancel", this.inputUp), this.$emit("update", [this.x, this.y]))
                        },
                        setDistanceAndAngle() {
                            this.moving.distance = (0, w.getDistance)({
                                x: 0,
                                y: 0
                            }, this.moving.current) / this.radius, this.moving.angle = Math.atan2(this.moving.current.y, this.moving.current.x);
                            const t = this.moving.distance > 1 ? 1 : this.moving.distance;
                            this.x = (0, k._fn)(t * Math.cos(this.moving.angle)), this.y = (0, k._fn)(t * Math.sin(this.moving.angle)), Math.abs(this.x) < this.moving.centerThreshold && Math.abs(this.y) < this.moving.centerThreshold && (this.x = 0, this.y = 0), this.$emit("update", [this.x, this.y])
                        }
                    }
                },
                H = D;
            var G = i(81656),
                z = (0, G.A)(H, O, F, !1, null, null, null);
            const N = z.exports;
            var U = function() {
                    var t = this,
                        e = t._self._c;
                    return e("div", {
                        staticClass: "pool-ball-rack-wrapper gap-2",
                        class: {
                            turn: t.turn,
                            flipped: t.flipped
                        }
                    }, [e("profile-picture", {
                        staticClass: "large",
                        attrs: {
                            config: t.user.profile.picture,
                            index: t.user.localPlay?.id
                        }
                    }), t.showPoints ? e("div", {
                        staticClass: "pool-points-wrapper"
                    }, [e("div", {
                        staticClass: "pool-points",
                        domProps: {
                            textContent: t._s(t.$n(t.points))
                        }
                    }), e("transition", {
                        attrs: {
                            name: "count-transition"
                        }
                    }, [t.showLastGivenPoints.active ? e("div", {
                        key: t.showLastGivenPoints.amount,
                        staticClass: "pool-points--toast",
                        class: {
                            "pool-points--toast-positive": t.showLastGivenPoints.amount > 0
                        }
                    }, [e("span", {
                        domProps: {
                            textContent: t._s(t.showLastGivenPoints.amount > 0 ? "+" : "-")
                        }
                    }), e("span", {
                        domProps: {
                            textContent: t._s(Math.abs(t.showLastGivenPoints.amount))
                        }
                    })]) : t._e()])], 1) : t._e(), t.showGameGroup ? [e("transition", {
                        attrs: {
                            name: "fade"
                        }
                    }, [t.turn ? e("div", {
                        key: "rack",
                        staticClass: "pool-ball-rack"
                    }, [e("div", {
                        staticClass: "pool-ball-wrapper",
                        class: {
                            "must-interact circle": t.hint.active
                        }
                    }, [e("v-popover", {
                        attrs: {
                            open: t.hint.active,
                            placement: "bottom-center",
                            "popover-class": ["info info-onboarding"],
                            "popover-wrapper-class": ["no-wrapper"],
                            "popover-arrow-class": ["tooltip-arrow", "tooltip-hover-help"],
                            "hide-on-click": !0,
                            "auto-hide": !0,
                            trigger: "manual",
                            offset: "0",
                            delay: {
                                show: 150,
                                hide: 0
                            }
                        }
                    }, [e("div", {
                        staticClass: "pool-ball-item"
                    }, [e("div", {
                        staticClass: "pool-ball-item--fill",
                        style: {
                            background: t.groupItem.background
                        }
                    }, [t.groupItem.src ? e("img", {
                        attrs: {
                            alt: "Pool ball item",
                            draggable: "false",
                            src: t.groupItem.src
                        }
                    }) : t._e()])]), e("div", {
                        style: {
                            "max-width": "200px"
                        },
                        attrs: {
                            slot: "popover"
                        },
                        on: {
                            click: function(e) {
                                return t.hideHint()
                            }
                        },
                        slot: "popover"
                    }, [e("span", {
                        domProps: {
                            textContent: t._s(t.hint.description)
                        }
                    })])])], 1)]) : t._e()])] : [e("div", {
                        staticClass: "pool-ball-rack",
                        class: {
                            flipped: t.flipped
                        }
                    }, t._l(t.groupItems, (function(i) {
                        return e("div", {
                            key: i.id,
                            staticClass: "pool-ball-wrapper"
                        }, [e("div", {
                            staticClass: "pool-ball-item",
                            class: {
                                clear: t.pocketed.includes(i.id) || i.empty
                            }
                        }, [i.src ? e("img", {
                            attrs: {
                                alt: "Pool ball item",
                                draggable: "false",
                                src: i.src
                            }
                        }) : t._e()])])
                    })), 0)], t._t("default")], 2)
                },
                V = [],
                q = i(14157),
                Y = i(47797);
            const K = {
                    data() {
                        return {
                            hintName: "bloob.poolRackSeenHints",
                            showLastGivenPoints: {
                                active: !1,
                                amount: 0
                            },
                            seenHints: {
                                snookerRedBallHint: !1,
                                snookerColoredBallHint: !1,
                                snookerSpecificColoredBallHint: !1
                            },
                            hint: {
                                active: !1,
                                id: void 0,
                                description: void 0
                            },
                            lastPoints: null
                        }
                    },
                    props: {
                        isSelf: {
                            type: Boolean
                        },
                        turn: {
                            type: Boolean
                        },
                        group: {
                            type: String
                        },
                        pocketed: {
                            type: Array
                        },
                        user: {
                            type: Object
                        },
                        flipped: {
                            type: Boolean,
                            default: !1
                        },
                        gameType: {
                            type: String
                        },
                        points: {
                            type: Number,
                            required: !1
                        }
                    },
                    mixins: [I.A],
                    components: {
                        ProfilePicture: Y.A
                    },
                    watch: {
                        turn() {
                            this.delayedHintCheck()
                        },
                        group() {
                            this.delayedHintCheck()
                        },
                        "user.data.points"() {
                            const t = this.user?.data?.points || 0,
                                e = t - (this.lastPoints || 0);
                            e > 0 && null !== this.lastPoints && (this.showLastGivenPoints.active = !0, this.showLastGivenPoints.amount = e, this.setTimer("showLastGivenPoints", 1750, (() => {
                                this.showLastGivenPoints.active = !1
                            }))), this.lastPoints = t
                        }
                    },
                    mounted() {
                        this.lastPoints = this.user?.data?.points ?? null, this.loadSeenHints(), this.delayedHintCheck()
                    },
                    computed: {
                        showPoints() {
                            return this.gameType === m().SNOOKER
                        },
                        showGameGroup() {
                            return this.gameType === m().SNOOKER || this.gameType === m().NINE_BALL_POOL
                        },
                        mustPocketEightBall() {
                            if (this.gameType !== m().EIGHT_BALL_POOL || !q.groups[this.group]) return !1;
                            for (const t of q.groups[this.group])
                                if (!this.pocketed.includes(t)) return !1;
                            return !0
                        },
                        groupItem() {
                            switch (this.group) {
                                case B().POOL1:
                                case B().POOL2:
                                case B().POOL3:
                                case B().POOL4:
                                case B().POOL5:
                                case B().POOL6:
                                case B().POOL7:
                                case B().POOL8:
                                case B().POOL9:
                                    if (this.$loaded.poolTextures) {
                                        const t = this.$resources.textures[`ball.${this.group}`];
                                        return {
                                            id: this.group,
                                            src: t ? t.image.src : null
                                        }
                                    }
                                    return {
                                        background: "white"
                                    };
                                case B().COLOR:
                                    return {
                                        background: "conic-gradient(\n\t\t\t\t\t\t\trgb(var(--color-yellow-main)) 0deg 60deg,\n\t\t\t\t\t\t\trgb(var(--color-green-alt)) 60deg 120deg,\n\t\t\t\t\t\t\trgb(var(--color-brown-alt)) 120deg 180deg,\n\t\t\t\t\t\t\trgb(var(--color-blue-main)) 180deg 240deg,\n\t\t\t\t\t\t\trgb(var(--color-pink-main)) 240deg 300deg,\n\t\t\t\t\t\t\trgb(var(--color-black-main)) 300deg 360deg\n\t\t\t\t\t\t)"
                                    };
                                case B().FREE:
                                    return {
                                        background: "white"
                                    };
                                case B().YELLOW:
                                    return {
                                        background: "rgb(var(--color-yellow-main))"
                                    };
                                case B().GREEN:
                                    return {
                                        background: "rgb(var(--color-green-alt))"
                                    };
                                case B().BROWN:
                                    return {
                                        background: "rgb(var(--color-brown-alt))"
                                    };
                                case B().BLUE:
                                    return {
                                        background: "rgb(var(--color-blue-main))"
                                    };
                                case B().PINK:
                                    return {
                                        background: "rgb(var(--color-pink-main))"
                                    };
                                case B().BLACK:
                                    return {
                                        background: "rgb(var(--color-black-main))"
                                    };
                                case B().RED:
                                default:
                                    return {
                                        background: "rgb(var(--color-red-main))"
                                    }
                            }
                        },
                        groupItems() {
                            const t = [];
                            if (this.gameType !== m().EIGHT_BALL_POOL) return t;
                            if (this.mustPocketEightBall || !q.groups[this.group]) {
                                for (const e of q.groups[B().SOLID]) t.push({
                                    id: e,
                                    empty: !0
                                });
                                if (this.mustPocketEightBall) {
                                    const e = this.$resources.textures["ball.pool8"];
                                    t[0] = {
                                        id: "pool8",
                                        src: e ? e.image.src : null
                                    }
                                }
                            } else
                                for (const e of q.groups[this.group]) {
                                    const i = this.$resources.textures[`ball.${e}`];
                                    t.push({
                                        id: e,
                                        src: i ? i.image.src : null
                                    })
                                }
                            return t
                        }
                    },
                    methods: {
                        loadSeenHints() {
                            try {
                                const t = localStorage.getItem(this.hintName);
                                if (!t) return;
                                const e = JSON.parse(t);
                                for (const i in e) i in this.seenHints && (this.seenHints[i] = e[i])
                            } catch (t) {
                                console.error("Local storage is unavailable.")
                            }
                        },
                        saveSeenHints() {
                            try {
                                localStorage.setItem(this.hintName, JSON.stringify(this.seenHints))
                            } catch (t) {
                                console.error("Local storage is unavailable.")
                            }
                        },
                        delayedHintCheck() {
                            this.setTimer("delayedHintCheck", 250, (() => {
                                this.hintCheck()
                            }))
                        },
                        hintCheck() {
                            if (this.isSelf && this.turn && this.group) {
                                if (this.gameType === m().SNOOKER) {
                                    switch (this.group) {
                                        case B().RED: {
                                            const t = "snookerRedBallHint";
                                            if (this.hint.active && this.hint.id === t) return;
                                            if (this.seenHints[t]) return void(this.hint.active = !1);
                                            if (this.points > 0 && this.pocketed.length > 0) return this.seenHints[t] = !0, this.hint.active = !1, void this.saveSeenHints();
                                            this.hint.id = t, this.hint.description = this.$t("info.snookerRedBallHint");
                                            break
                                        }
                                        case B().COLOR: {
                                            const t = "snookerColoredBallHint";
                                            if (this.hint.active && this.hint.id === t) return;
                                            if (this.seenHints[t]) return void(this.hint.active = !1);
                                            this.hint.id = t, this.hint.description = this.$t("info.snookerColoredBallHint"), this.seenHints[t] = !0, this.saveSeenHints();
                                            break
                                        }
                                        case B().FREE:
                                            return void(this.hint.active = !1);
                                        default: {
                                            const t = "snookerSpecificColoredBallHint";
                                            if (this.hint.active && this.hint.id === t) return;
                                            if (this.seenHints[t]) return void(this.hint.active = !1);
                                            this.hint.id = t, this.hint.description = this.$t("info.specificColoredBallHint"), this.seenHints[t] = !0, this.saveSeenHints();
                                            break
                                        }
                                    }
                                    this.hint.active = !1, this.$nextTick((() => {
                                        this.hint.active = !0
                                    }))
                                }
                            } else this.hint.active = !1
                        },
                        hideHint() {
                            this.updateFirstTime(!0)
                        }
                    }
                },
                j = K;
            var W = (0, G.A)(j, U, V, !1, null, null, null);
            const X = W.exports;
            var J = i(69683),
                Z = i(89858),
                Q = i(51012);
            const tt = {
                    data() {
                        return {
                            loadError: !1,
                            view: {
                                sideControls: !1,
                                horizontal: !0
                            },
                            firstTime: {
                                hit: !1
                            },
                            keys: {
                                cancel: {
                                    list: [27, 8]
                                }
                            },
                            spinPoint: [0, 0],
                            selectingSpinPoint: !1,
                            selectingPullForce: !1,
                            touchAngle: !1,
                            pocketed: [],
                            draggingBall: {
                                active: !1,
                                position: {
                                    top: 200,
                                    left: 100
                                }
                            },
                            pull: {
                                horizontal: !0,
                                active: !1,
                                angle: Math.PI,
                                angleOffset: 0,
                                distance: 0,
                                power: 0,
                                velocity: 0,
                                position: {
                                    ball: {
                                        x: 0,
                                        y: 0
                                    },
                                    start: {
                                        distance: 0,
                                        x: 0,
                                        y: 0
                                    },
                                    end: {
                                        distance: 0,
                                        x: 0,
                                        y: 0
                                    }
                                }
                            },
                            activeTouchId: null,
                            rendererMouseMoveListener: null,
                            rendererMouseDownListener: null
                        }
                    },
                    mixins: [I.A],
                    props: {
                        isActive: {
                            type: Boolean,
                            default: !1
                        },
                        isSimulating: {
                            type: Boolean,
                            default: !1
                        },
                        sleepEventCallback: {
                            type: Function,
                            default: void 0
                        },
                        draggable: {
                            type: Object,
                            default: () => {}
                        },
                        balls: {
                            type: Object,
                            default: () => {}
                        },
                        config: {
                            type: Object,
                            default: () => {}
                        },
                        fieldConfig: {
                            type: Object,
                            default: () => {}
                        },
                        inputConfig: {
                            type: Object,
                            default: () => {}
                        },
                        groups: {
                            type: Object,
                            default: () => {}
                        },
                        seed: {
                            type: String
                        },
                        speed: {
                            type: Number,
                            default: 1
                        },
                        group: {
                            type: String,
                            default: void 0
                        },
                        blockInteract: {
                            type: Boolean,
                            default: !1
                        },
                        hoverVelocity: {
                            type: Number,
                            default: 0
                        },
                        hoverAngle: {
                            type: Number,
                            default: Math.PI
                        },
                        hoverModifier: {
                            type: Array,
                            default: () => [0, 0]
                        },
                        hoverDraggingBall: {
                            type: Boolean,
                            default: !1
                        },
                        breaking: {
                            type: Boolean,
                            default: !1
                        },
                        self: {
                            type: Object,
                            required: !0
                        },
                        opponent: {
                            type: Object,
                            required: !0
                        },
                        opponents: {
                            type: Array,
                            required: !1
                        },
                        users: {
                            type: Object,
                            required: !1
                        },
                        turn: {
                            type: Boolean
                        },
                        preview: {
                            type: Boolean
                        },
                        gameType: {
                            type: String
                        },
                        turnId: {
                            type: String
                        },
                        turnCount: {
                            type: Number
                        }
                    },
                    watch: {
                        "$loaded.poolTextures"() {
                            this.$loaded.poolTextures && this.init()
                        },
                        "game.view"() {
                            this.game.view === $().GAME && this.resizeCheck()
                        },
                        "display.height.current"() {
                            this.resizeCheck()
                        },
                        "display.width.current"() {
                            this.resizeCheck()
                        },
                        "display.mobile"() {
                            this.resizeCheck()
                        },
                        "display.scale.current"() {
                            this.field?.setScale(this.display.scale.current)
                        },
                        "display.touch"() {
                            this.field?.setTouchControls(this.display.touch)
                        },
                        isSimulating() {
                            !this.isSimulating && this.field && this.endOfSimulationCheck()
                        },
                        isActive() {
                            this.field && this.forceFieldState()
                        },
                        group() {
                            this.field?.setGroup(this.group)
                        },
                        breaking() {
                            this.field?.setBreaking(this.breaking)
                        },
                        draggable() {
                            this.field?.setDraggable(this.draggable)
                        },
                        hoverVelocity() {
                            this.field?.setVelocity(this.hoverVelocity)
                        },
                        hoverAngle() {
                            this.field?.setAngle(this.hoverAngle)
                        },
                        preview() {
                            this.field?.setPreview(this.preview)
                        },
                        hoverModifier() {
                            this.field && this.setModifier(this.hoverModifier)
                        },
                        hoverDraggingBall() {
                            this.field?.setBallDragging(this.hoverDraggingBall)
                        },
                        balls() {
                            this.field && this.updateFieldState()
                        },
                        seed() {
                            this.field && this.forceFieldState()
                        },
                        speed() {
                            this.field && this.forceFieldState()
                        },
                        turn() {
                            this.field && this.isActive && this.isSimulating && this.updateTurn()
                        },
                        turnCount() {
                            this.field && this.isActive && this.startNewRound()
                        }
                    },
                    components: {
                        SpinSelector: N,
                        PoolBallRack: X,
                        LoadingEllipsis: J.A,
                        ErrorMessage: Z.A,
                        UserCount: Q.A
                    },
                    computed: {
                        ...(0, A.aH)(["display", "game"]),
                        scale() {
                            return this.display.scale.current
                        },
                        animationAngle() {
                            return (this.pull.angle + Math.PI) * (180 / Math.PI)
                        },
                        roundingNumber() {
                            return Number(this.seed?.charAt(this.seed.length - 3) || 0)
                        }
                    },
                    mounted() {
                        this.loadFirstTimeSession(), this.checkSize(), this.init(), this.$nextTick((() => {
                            this.$audio.loadDependencies(["pool_ball_hit", "pool_ball_hit_cushion", "pool_ball_hit_cue", "pool_bat_place", "pool_ball_place", "pool_pocket"])
                        }))
                    },
                    beforeDestroy() {
                        if (!this.field) return;
                        this.$refs.renderer.removeEventListener("mousedown", this.inputDown), this.$refs.renderer.removeEventListener("touchstart", this.inputDown), window.removeEventListener("keydown", this.keydownEvent), window.removeEventListener("touchmove", this.interactMove), window.removeEventListener("touchend", this.inputUp), window.removeEventListener("touchcancel", this.inputUp), window.removeEventListener("mousemove", this.interactMove), window.removeEventListener("mouseup", this.inputUp), window.removeEventListener("blur", this.forceReleaseInteractions), document.removeEventListener("visibilitychange", this.visibilityChangeEvent), window.removeEventListener("resize", this.resizeCheck), window.removeEventListener("orientationchange", this.resizeCheck), window.removeEventListener("pageshow", this.resizeCheck), window.visualViewport && window.visualViewport.removeEventListener("resize", this.resizeCheck);
                        const t = window.screen?.orientation;
                        t?.removeEventListener && t.removeEventListener("change", this.resizeCheck), this.rendererMouseMoveListener && (this.$refs.renderer.removeEventListener("mousemove", this.rendererMouseMoveListener), this.rendererMouseMoveListener = null), this.rendererMouseDownListener && (this.$refs.renderer.removeEventListener("mousedown", this.rendererMouseDownListener), this.rendererMouseDownListener = null), this.destroy()
                    },
                    beforeCreate() {
                        this.$loaded.poolTextures || (this.$set(this.$loaded, "poolTextures", !1), this.$set(this.$loaded, "poolTexturesError", !1), (0, L.Pp)(this.$resources.textures, {
                            "ball.pool1": {
                                minFilter: r.kRr
                            },
                            "ball.pool2": {
                                minFilter: r.kRr
                            },
                            "ball.pool3": {
                                minFilter: r.kRr
                            },
                            "ball.pool4": {
                                minFilter: r.kRr
                            },
                            "ball.pool5": {
                                minFilter: r.kRr
                            },
                            "ball.pool6": {
                                minFilter: r.kRr
                            },
                            "ball.pool7": {
                                minFilter: r.kRr
                            },
                            "ball.pool8": {
                                minFilter: r.kRr
                            },
                            "ball.pool9": {
                                minFilter: r.kRr
                            },
                            "ball.pool10": {
                                minFilter: r.kRr
                            },
                            "ball.pool11": {
                                minFilter: r.kRr
                            },
                            "ball.pool12": {
                                minFilter: r.kRr
                            },
                            "ball.pool13": {
                                minFilter: r.kRr
                            },
                            "ball.pool14": {
                                minFilter: r.kRr
                            },
                            "ball.pool15": {
                                minFilter: r.kRr
                            },
                            "ball.filler": {
                                minFilter: r.kRr
                            },
                            "ball.cue": {
                                minFilter: r.kRr
                            },
                            "ball.draggable": {
                                minFilter: r.kRr
                            },
                            "field.cushionCenter": {},
                            "field.cushionCornerHalf": {},
                            "field.cushionCornerSharp": {},
                            "field.cushionCenterShadow": {},
                            "field.cushionCornerHalfShadow": {},
                            "field.cushionCornerSharpShadow": {},
                            "field.green": {},
                            "field.woodMiddle": {},
                            "field.holeCenter": {},
                            "field.greenCenter": {},
                            "field.holeCorner": {},
                            "field.greenCorner": {},
                            "cueStick.default": {},
                            "cueStick.powerLevel": {},
                            "effect.light": {},
                            "effect.noise": {},
                            "effect.shadow": {},
                            "effect.stickShadow": {},
                            "effect.glossy": {
                                mapping: r.wfO
                            }
                        }, (() => {
                            this.$set(this.$loaded, "poolTextures", !0)
                        }), (() => {
                            this.$set(this.$loaded, "poolTexturesError", !0)
                        })))
                    },
                    methods: {
                        getTouchByIdentifier(t, e) {
                            if (!t || null == e) return null;
                            for (let i = 0; i < t.length; i++) {
                                const s = t[i];
                                if (s?.identifier === e) return s
                            }
                            return null
                        },
                        resolvePointerEvent(t, {
                            lockTouch: e = !1
                        } = {}) {
                            const i = t?.changedTouches,
                                s = t?.touches;
                            if ((!i || 0 === i.length) && (!s || 0 === s.length)) return {
                                isTouch: !1,
                                event: t,
                                clientX: t?.clientX,
                                clientY: t?.clientY,
                                pageX: t?.pageX,
                                pageY: t?.pageY
                            };
                            if (e && null == this.activeTouchId) {
                                const t = i?.[0] || s?.[0];
                                this.activeTouchId = t?.identifier ?? null
                            }
                            let a = this.getTouchByIdentifier(i, this.activeTouchId) || this.getTouchByIdentifier(s, this.activeTouchId);
                            return a || (a = i?.[0] || s?.[0]), a ? (null == this.activeTouchId && (this.activeTouchId = a.identifier ?? null), {
                                isTouch: !0,
                                touch: a,
                                event: {
                                    changedTouches: [a],
                                    touches: s || [a],
                                    clientX: a.clientX,
                                    clientY: a.clientY,
                                    pageX: a.pageX,
                                    pageY: a.pageY,
                                    preventDefault: t?.preventDefault?.bind(t)
                                },
                                clientX: a.clientX,
                                clientY: a.clientY,
                                pageX: a.pageX,
                                pageY: a.pageY
                            }) : null
                        },
                        releaseActiveTouch(t) {
                            if (null == this.activeTouchId) return;
                            const e = this.getTouchByIdentifier(t?.changedTouches, this.activeTouchId);
                            e && (this.activeTouchId = null)
                        },
                        reset() {
                            this.field?.stopAllTweens(), this.field?.stopAllTimers(), this.field?.sleep()
                        },
                        endOfSimulationCheck() {
                            this.field?.stopPlayback(), this.field?._playback?.queuedSync || (this.forceReleaseInteractions(), this.updateFieldState())
                        },
                        forceFieldState() {
                            this.seed && this.field && this.isActive && this.$nextTick((() => {
                                this.setTimer("fieldStateTimer", 50, (() => {
                                    this.instantForceFieldState()
                                }))
                            }))
                        },
                        instantForceFieldState() {
                            this.seed && this.field && this.isActive && this.$nextTick((() => {
                                this.field?.recreate(this.balls, this.seed, this.speed, this.breaking), this.$nextTick((() => {
                                    this.field?.setDraggable(this.draggable), this.field?.setBreaking(this.breaking), this.field?.setGroup(this.group), this.updateDraggingBallPosition(), this.updatePocketed(), this.updateTurn()
                                }))
                            }))
                        },
                        updateFieldState() {
                            this.field?.setBalls(this.balls, this.breaking), this.updateDraggingBallPosition(), this.updatePocketed(), this.updateTurn()
                        },
                        loadFirstTimeSession() {
                            try {
                                const t = JSON.parse(sessionStorage.getItem("8ballpool.firstTime"));
                                this.$set(this, "firstTime", n()(this.firstTime, t || {}))
                            } catch (t) {
                                console.error("Session storage is unavailable.")
                            }
                        },
                        updateFirstTime(t, e = !0) {
                            if (this.firstTime[t] !== e) {
                                this.firstTime[t] = e;
                                try {
                                    sessionStorage.setItem("8ballpool.firstTime", JSON.stringify(this.firstTime))
                                } catch (i) {
                                    console.error("Session storage is unavailable.")
                                }
                            }
                        },
                        updateView({
                            horizontal: t,
                            sideControls: e
                        } = {}) {
                            null != e && (this.view.sideControls = e, this.field?.setSideControls(e)), null != t && (this.view.horizontal = t, this.field?.setHorizontal(t))
                        },
                        init() {
                            if (!this.$loaded["poolTextures"]) return;
                            this.$refs.renderer.addEventListener("mousedown", this.inputDown), this.$refs.renderer.addEventListener("touchstart", this.inputDown), window.addEventListener("keydown", this.keydownEvent), window.addEventListener("touchmove", this.interactMove), window.addEventListener("touchend", this.inputUp), window.addEventListener("touchcancel", this.inputUp), window.addEventListener("mousemove", this.interactMove), window.addEventListener("mouseup", this.inputUp), window.addEventListener("blur", this.forceReleaseInteractions), document.addEventListener("visibilitychange", this.visibilityChangeEvent), window.addEventListener("resize", this.resizeCheck), window.addEventListener("orientationchange", this.resizeCheck), window.addEventListener("pageshow", this.resizeCheck), window.visualViewport && window.visualViewport.addEventListener("resize", this.resizeCheck);
                            const t = window.screen?.orientation;
                            t?.addEventListener && t.addEventListener("change", this.resizeCheck), this.field = new E({
                                domElement: this.$refs.renderer,
                                textures: this.$resources.textures,
                                audio: this.$audio,
                                balls: this.balls,
                                config: this.config,
                                inputConfig: this.inputConfig,
                                fieldConfig: this.fieldConfig,
                                groups: this.groups,
                                seed: this.seed,
                                speed: this.speed,
                                scale: this.display.scale.current,
                                horizontal: this.view.horizontal,
                                sideControls: this.view.sideControls,
                                touchControls: this.display.touch,
                                preview: this.preview,
                                gameType: this.gameType,
                                sleepEventCallback: this.sleepEventCallback
                            }), this.$nextTick((() => {
                                if (this.field) {
                                    if (this.field.loadError) return this.loadError = this.field.loadError, void this.destroy();
                                    this.field.setDraggable(this.draggable), this.field.setBreaking(this.breaking), this.field.setGroup(this.group), this.rendererMouseMoveListener = t => {
                                        this.field?.interactUpdate(t)
                                    }, this.rendererMouseDownListener = t => {
                                        this.field?.interactUpdate(t)
                                    }, this.$refs.renderer.addEventListener("mousemove", this.rendererMouseMoveListener), this.$refs.renderer.addEventListener("mousedown", this.rendererMouseDownListener), this.updateTurn(), this.startNewRound(), this.instantForceFieldState(), this.setTimer("initialLoadTimer", 100, (() => {
                                        this.$emit("on-loaded")
                                    }))
                                }
                            }))
                        },
                        checkSize() {
                            const t = window.innerWidth > 530,
                                e = this.$refs?.renderer?.getBoundingClientRect?.();
                            if (!e) return;
                            const i = e.width / e.height > 1.5;
                            this.updateView({
                                horizontal: t,
                                sideControls: !!this.display.mobile && i
                            })
                        },
                        resizeCheck() {
                            this.setTimer("resizeTimer", 1, (() => {
                                this.resize(), this.setTimer("resizeTimer", 500, (() => {
                                    this.resize(), this.setTimer("resizeTimer", 1250, (() => {
                                        this.resize()
                                    }))
                                }))
                            }))
                        },
                        resize() {
                            this.checkSize(), this.field && (this.field.resize(), this.updateDraggingBallPosition())
                        },
                        updatePocketed() {
                            if (!this.field?.physics?.pocketed) return;
                            const t = Object.keys(this.field.physics.pocketed.balls);
                            this.$set(this, "pocketed", t)
                        },
                        setModifier(t) {
                            this.turn || this.updateSpinPoint(t)
                        },
                        openSpinPointSelector() {
                            this.selectingSpinPoint = !0
                        },
                        closeSpinPointSelector() {
                            this.selectingSpinPoint = !1
                        },
                        startPull(t) {
                            if (!this.turn) return;
                            const e = t.changedTouches;
                            if (e && window.isDeviceZoomed) return;
                            const i = e ? e[0].pageX : t.pageX,
                                s = e ? e[0].pageY : t.pageY;
                            this.selectingPullForce = !0, this.pull.active = !0, this.pull.power = 0, this.pull.position.start.x = i, this.pull.position.start.y = s
                        },
                        cancelPull() {
                            this.pull.active && (this.pull.power = 0, this.pull.velocity = 0, this.field?.setVelocity(this.pull.velocity), this.stopPull())
                        },
                        stopPull() {
                            this.selectingPullForce = !1, this.pull.power = 0, this.pull.active = !1, this.pull.angleOffset = 0
                        },
                        updateSpinPoint(t) {
                            !t || 2 !== t.length || isNaN(t[0]) || isNaN(t[1]) || (this.spinPoint = [t[0], t[1]], this.field?.updateSpinPoint(this.spinPoint), this.turn && this.$emit("update-modifier", this.spinPoint))
                        },
                        updateTurn() {
                            if (this.field && this.isActive && (this.field.updateTurn(this.turn), this.turn && this.lastInteractMoveEvent)) {
                                const t = this.lastInteractMoveEvent;
                                this.interactMove(t), this.$nextTick((() => {
                                    this.interactMove(t)
                                })), this.setTimer("interactMoveTimer", 100, (() => {
                                    this.interactMove(t)
                                }))
                            }
                        },
                        startNewRound() {
                            this.field && (this.field?.updateTurn(this.turn), this.pull.angle = this.field.data.angle, this.pull.velocity = 0, this.field?.setVelocity(0), this.updatePocketed(), this.updateSpinPoint([0, 0]), this.closeSpinPointSelector(), this.turn || (this.pull.active = !1, this.draggingBall.active = !1, this.field?.setBallDragging(!1)))
                        },
                        visibilityChangeEvent() {
                            document.hidden ? this.forceReleaseInteractions() : this.isSimulating || this.endOfSimulationCheck()
                        },
                        forceReleaseInteractions() {
                            this.activeTouchId = null, this.draggingBall.active && (this.draggingBall.active = !1, this.field?.setBallDragging(!1), this.$emit("update-dragging-ball", !1)), this.touchAngle && (this.touchAngle = !1), (this.selectingPullForce || this.pull.active) && this.cancelPull()
                        },
                        updateDraggingBallPosition() {
                            if (!this.field?.$s.balls?.["cue"]) return;
                            const {
                                x: t,
                                y: e
                            } = this.field.getBallScreenPosition({
                                type: "cue"
                            });
                            this.draggingBall.position.left = t, this.draggingBall.position.top = e
                        },
                        keydownEvent(t) {
                            this.keys.cancel.list.includes(t.keyCode) && this.cancelPull()
                        },
                        interactMove(t) {
                            const e = this.resolvePointerEvent(t);
                            if (!e) return;
                            if (this.selectingSpinPoint || this.blockInteract || !this.field || !this.turn) return void(this.lastInteractMoveEvent = e.event);
                            const i = e.isTouch ? e.event.changedTouches : null;
                            if (i && window.isDeviceZoomed) return;
                            if (this.draggingBall.active && !i && 0 === t.buttons) return void this.forceReleaseInteractions();
                            e.event?.preventDefault?.(), this.lastInteractMoveEvent = e.event;
                            const s = e.clientX / this.scale,
                                a = e.clientY / this.scale,
                                o = e.pageX,
                                n = e.pageY,
                                r = this.$refs["renderer"].getBoundingClientRect();
                            if (this.selectingPullForce) {
                                const t = this.$refs["launcher"];
                                if (!t) return;
                                const e = this.view.horizontal && !this.view.sideControls,
                                    i = this.$refs["launcher"].getBoundingClientRect(),
                                    s = e ? i.width : i.height,
                                    a = this.pull.position;
                                a.end.x = o, a.end.y = n;
                                let r = (e ? a.start.x - a.end.x : a.end.y - a.start.y) / s;
                                r = r < 0 ? 0 : r > 1 ? 1 : r;
                                const l = this.inputConfig,
                                    h = this.field.data.breaking ? "breakVelocity" : "velocity",
                                    c = l.pull[h].max - l.pull[h].min;
                                this.pull.power = r, this.pull.velocity = l.pull.velocity.min + c * this.pull.power, this.field?.setVelocity(this.pull.velocity), this.$emit("update-velocity", this.pull.velocity)
                            } else if (this.draggingBall.active) this.updateCueBallPosition(e.event);
                            else if (this.pull.active) this.updateEndDistance({
                                clientY: a,
                                clientX: s
                            });
                            else if (this.touchAngle && i || !this.touchAngle && !i) {
                                const {
                                    x: t,
                                    y: i
                                } = this.field.getBallScreenPosition({
                                    type: "cue"
                                });
                                this.draggingBall.position.left = t, this.draggingBall.position.top = i;
                                const o = Math.atan2(r.y + i - a, r.x + t - s) + this.pull.angleOffset,
                                    n = Math.abs(o).toFixed(3),
                                    l = Number(n.charAt(0)),
                                    h = Number(n.charAt(n.length - 1)),
                                    c = (l + h + this.roundingNumber).toString(),
                                    d = Number(c.charAt(c.length - 1)) || 1,
                                    p = Number(o.toFixed(3) + d);
                                this.pull.angle = p, e.event.angleOffset = this.pull.angle, this.field.setAngle(p), this.$emit("update-angle", p)
                            }
                        },
                        inputDown(t) {
                            if (!this.field || this.selectingSpinPoint || this.blockInteract || !this.turn || this.draggingBall.active || this.pull.active || this.touchAngle) return;
                            if ("mousedown" === t.type && 0 !== t.button) return;
                            const e = this.resolvePointerEvent(t, {
                                lockTouch: !0
                            });
                            if (!e) return;
                            const i = e.isTouch ? e.event.changedTouches : null;
                            if (i && window.isDeviceZoomed) return;
                            const s = e.clientX / this.scale,
                                a = e.clientY / this.scale,
                                o = this.$refs["renderer"].getBoundingClientRect();
                            if (this.field.interactUpdate(e.event), this.field.canDragBall({
                                    type: "cue"
                                })) return this.updateCueBallPosition(e.event), this.draggingBall.active = !0, this.field.setBallDragging(!0), void this.$emit("update-dragging-ball", !0);
                            if (i) {
                                e.event?.preventDefault?.(), this.touchAngle = !0;
                                const {
                                    x: t,
                                    y: i
                                } = this.field.getBallScreenPosition({
                                    type: "cue"
                                }), n = Math.atan2(o.y + i - a, o.x + t - s);
                                return this.pull.angleOffset = this.field.data.angle - n, void this.interactMove(e.event)
                            }
                            const {
                                x: n,
                                y: r
                            } = this.field.getBallScreenPosition({
                                type: "cue"
                            });
                            this.pull.position.ball.x = n, this.pull.position.ball.y = r, this.pull.position.start.x = s, this.pull.position.start.y = a, this.pull.position.start.distance = (0, w.getDistance)(this.pull.position.ball, this.pull.position.start), this.pull.position.end.x = s, this.pull.position.end.y = a, this.pull.active = !0, this.pull.power = 0
                        },
                        inputUp(t) {
                            const e = this.resolvePointerEvent(t);
                            if (e) {
                                if (!e.isTouch && "mouseup" === t?.type) {
                                    if (0 !== t.button) return;
                                    if (1 === (1 & t.buttons)) return
                                }
                                if (this.field) {
                                    if (this.draggingBall.active) return this.updateCueBallPosition(e.event), this.releaseActiveTouch(t), void this.forceReleaseInteractions();
                                    if (this.touchAngle) return this.touchAngle = !1, void this.releaseActiveTouch(t);
                                    if (!this.selectingSpinPoint && !this.blockInteract && this.pull.active) {
                                        if (e.event?.preventDefault?.(), this.pull.power && this.pull.power > .05) {
                                            const t = "cue",
                                                e = {
                                                    type: t,
                                                    position: this.field.getBallPosition({
                                                        type: t
                                                    }),
                                                    velocity: (0, k._fn)(this.pull.velocity),
                                                    angle: (0, k._fn)(this.pull.angle + Math.PI),
                                                    modifier: JSON.parse(JSON.stringify(this.spinPoint))
                                                };
                                            this.pull.velocity = 0, this.$emit("hit-ball", e), this.field?.setSeed(this.seed), this.field?.hitBall(e), this.updateFirstTime("hit")
                                        } else this.pull.power = 0, this.pull.velocity = 0, this.field?.setVelocity(this.pull.velocity);
                                        this.stopPull(), this.releaseActiveTouch(t)
                                    }
                                }
                            } else this.forceReleaseInteractions()
                        },
                        updateCueBallPosition(t) {
                            this.field?.interactUpdate(t);
                            const e = this.field?.ballDragMove({
                                type: "cue"
                            });
                            this.$emit("update-ball", {
                                type: "cue",
                                position: e
                            })
                        },
                        animateBall(t) {
                            this.field?.animateBall(t)
                        },
                        hitBall(t) {
                            this.field?.setSeed(this.seed), this.field?.hitBall(t)
                        },
                        cancelHitBall() {
                            this.field?.cancelHitBall()
                        },
                        updateEndDistance({
                            clientY: t,
                            clientX: e
                        }) {
                            this.pull.position.end.x = e, this.pull.position.end.y = t, this.pull.position.end.distance = (0, w.getDistance)(this.pull.position.ball, this.pull.position.end);
                            const i = (0, w.getDistance)(this.pull.position.start, this.pull.position.end);
                            this.pull.distance = i;
                            const s = this.inputConfig,
                                a = this.field?.data.breaking ? "breakVelocity" : "velocity",
                                o = s.pull[a].max - s.pull[a].min,
                                n = s.pull.distance.max - s.pull.distance.min,
                                r = Math.abs(Math.atan2(this.pull.position.end.y - this.pull.position.start.y, this.pull.position.end.x - this.pull.position.start.x) - this.pull.angle);
                            let l = this.pull.distance / n;
                            l = l < 0 ? 0 : l > 1 ? 1 : l;
                            const h = Math.PI / 2;
                            r > h && r < Math.PI + h && (l = 0);
                            const c = s.pull.velocity.min + o * l;
                            this.pull.power = l, this.pull.velocity = Number(c.toFixed(4)), this.field?.setVelocity(this.pull.velocity), this.$emit("update-velocity", this.pull.velocity)
                        },
                        destroy() {
                            this.field?.destroy(), delete this.field
                        }
                    }
                },
                et = tt;
            var it = (0, G.A)(et, s, a, !1, null, null, null);
            const st = it.exports
        },
        25280: (t, e, i) => {
            "use strict";
            i.d(e, {
                A: () => S
            });
            i(86323);
            var s = i(29701),
                a = i(66769),
                o = i(68610),
                n = i(89350),
                r = i(43653),
                l = i(43298),
                h = i(850),
                c = i(55879),
                d = i.n(c),
                p = i(68847),
                u = i.n(p),
                g = i(30765),
                f = i.n(g),
                m = i(344),
                y = i(90108),
                v = i.n(y);
            const b = Object.values(m.Xk),
                w = {
                    props: ["focus"],
                    data() {
                        return {
                            config: void 0,
                            inputConfig: void 0,
                            fieldConfig: void 0,
                            groups: void 0,
                            receivedHit: !1,
                            hasHitBall: !1,
                            startGame: !1,
                            balls: {},
                            localTurnCount: 0,
                            hover: {
                                angle: null,
                                velocity: null,
                                draggingBall: null,
                                modifier: null
                            },
                            update: {
                                last: performance.now(),
                                changes: [],
                                data: {
                                    angle: null,
                                    velocity: null,
                                    draggingBall: null,
                                    modifier: [null, null]
                                }
                            },
                            leaderboardConfig: {
                                rows: [{
                                    class: "spacing--rank",
                                    type: "value",
                                    value: t => `#${t.data.place}`
                                }, {
                                    header: this.$t("misc.player"),
                                    type: "player",
                                    class: "spacing--player"
                                }, {
                                    header: this.$t("misc.wins"),
                                    type: "value",
                                    value: t => t.data.wins
                                }, {
                                    header: this.$t("misc.fouls"),
                                    type: "value",
                                    value: t => t.data.fouls
                                }, {
                                    header: this.$t("misc.shots"),
                                    type: "value",
                                    value: t => t.data.shots
                                }, {
                                    header: this.$t("misc.pocketed"),
                                    type: "value",
                                    value: t => t.data.pocketed
                                }]
                            }
                        }
                    },
                    computed: {
                        ...(0, s.aH)(["user", "game", "status", "display"]),
                        isSimulating() {
                            return this.game.data.state === d().SIMULATING_PHYSICS
                        },
                        showSimulationProgress() {
                            return this.game.data.state === d().SIMULATING_PHYSICS && !this.receivedHit
                        },
                        canHitBall() {
                            return this.isTurn && this.game.data.state === d().IN_PROGRESS && !this.hasHitBall
                        },
                        users() {
                            return (0, o.A)({
                                data: this.game.data.users,
                                attr: "-place"
                            })
                        },
                        isActive() {
                            return d().IN_PROGRESS === this.game.data.state || d().SIMULATING_PHYSICS === this.game.data.state
                        },
                        isTurn() {
                            return this.turn.id === this.user.id || this.turn.localPlay && this.turn.localPlay.parent === this.user.id
                        },
                        isBreaking() {
                            return this.game.data.current.breaking
                        },
                        group() {},
                        self() {
                            return this.game.data?.users?.[this.user.id] ?? v()
                        },
                        opponent() {
                            if (this.game.data.users)
                                for (const t in this.game.data.users)
                                    if (t !== this.user.id) return this.game.data.users[t];
                            return v()
                        },
                        gameDuration() {
                            let t = 0;
                            const e = this.game.data.timestamps;
                            return e.start && e.end && (t = e.end - e.start), (0, n.A)(this.$tc.bind(this), {
                                ms: t,
                                type: f().CLOCK
                            })
                        },
                        draggable() {
                            return this.game.data.current.draggable ? this.game.data.current.draggable : {
                                active: !1
                            }
                        },
                        turn() {
                            return !!this.game.data.current.turn && this.game.data.users[this.game.data.current.turn]
                        },
                        order() {
                            return this.game.data.current.order ? this.game.data.current.order : []
                        }
                    },
                    mixins: [l.A, h.A],
                    watch: {
                        "game.data.id"() {
                            this.reset()
                        },
                        "game.data.state"() {
                            this.updateGameState(), this.updateHeader()
                        },
                        "game.data.users"() {
                            this.updateHeader()
                        },
                        "game.data.current.turnCount"() {
                            this.startNewRound()
                        },
                        "game.data.current.turn"() {
                            this.updateTurn()
                        },
                        "game.data.current.pickedGroupTypes"() {
                            this.game.data.current.pickedGroupTypes && this.$nextTick((() => {
                                this.notification({
                                    type: "type"
                                })
                            }))
                        },
                        "game.data.current.balls"() {
                            this.updateBalls()
                        }
                    },
                    sockets: {
                        game_action({
                            type: t,
                            data: e
                        }) {
                            if (this.game.data.id) switch (t) {
                                case u().HIT_BALL:
                                    this.receivedHit = !0, this.hitBall(e);
                                    break;
                                case u().HOVER:
                                    this.updateHover(e);
                                    break;
                                case u().FORCE_CURRENT: {
                                    this.updateBalls(!0);
                                    const t = this.$refs["poolField"];
                                    t?.cancelHitBall(), t?.field?.setSeed(this.game.data.current.seed);
                                    break
                                }
                                default:
                                    break
                            }
                        },
                        game_debug({
                            pool: t
                        }) {
                            this.game.data.id && t && (t.hit && this.$refs["poolField"].field.debug_setHole({
                                name: "hit",
                                ...t.hit
                            }), t.target && this.$refs["poolField"].field.debug_setHole({
                                name: "target",
                                ...t.target
                            }))
                        },
                        game_notification(t) {
                            this.game.data.id && this.notification(t)
                        }
                    },
                    methods: {
                        loadedCheck() {
                            this.game.data.id && !this.game.data.current.serverPhysics && this.game.data.state === d().SIMULATING_PHYSICS && this.$store.dispatch("game/ACTION", {
                                type: u().READY
                            })
                        },
                        sleepEventCallback() {
                            this.game.data.id ? (this.sentGameState = !0, this.retryGameState(), this.setTimer("sleep_callback", 25, (() => {
                                if (!this.game.data.id) return void this.stopRetryGameState();
                                const t = this.$refs["poolField"],
                                    e = t?.field?.physics;
                                e && (this.schedulePostSimulationCueStickCheck(), this.$store.dispatch("game/ACTION", {
                                    type: u().GAME_STATE,
                                    data: {
                                        balls: e.getBalls(),
                                        tracking: e.tracking,
                                        pocketed: e.getPocketedBalls()
                                    }
                                }))
                            }))) : this.stopRetryGameState()
                        },
                        retryGameState() {
                            this.sentGameState && this.game.data.id ? this.setTimer("retry_game_state", 5e3, (() => {
                                this.sleepEventCallback()
                            })) : this.stopRetryGameState()
                        },
                        stopRetryGameState() {
                            this.sentGameState = !1, this.clearTimer("retry_game_state")
                        },
                        schedulePostSimulationCueStickCheck() {
                            this.setTimer("post_simulation_cue_stick_check", 3e3, (() => {
                                this.postSimulationCueStickCheck()
                            }))
                        },
                        postSimulationCueStickCheck() {
                            if (!this.game.data.id || this.game.data.state !== d().IN_PROGRESS) return;
                            const t = this.$refs["poolField"],
                                e = !!t?.field?.$s?.cueStick?.visible,
                                i = !!t?.field?.data?.draggingBall;
                            e || i || (console.warn("[DESYNC]", "Cue stick is still hidden 3s after simulation ended."), this.forceSync())
                        },
                        scheduleSyncCheck() {
                            this.setTimer("sync_check", 150, (() => {
                                this.syncCheck()
                            }))
                        },
                        syncCheck() {
                            const t = this.$refs["poolField"];
                            if (this.game.data.id && this.game.data.state === d().IN_PROGRESS && t?.field?.physics) {
                                if (!t.draggingBall.active && (t.field.animating || !t.field.$s.cueStick.visible)) return console.warn("[DESYNC]", "Field is animating or not showing cue stick."), this.forceSync();
                                if (t.field.physics.pocketed["cue"]) return console.warn("[DESYNC]", "Cue ball is pocketed."), this.forceSync();
                                for (const e in this.game.data.current.balls) {
                                    const i = this.game.data.current.balls[e];
                                    if (!i.pocket && t.field.physics.pocketed[e]) return console.warn("[DESYNC]", "Ball is (not) pocketed."), this.forceSync();
                                    const s = t.field.physics.balls[e]?.position || [0, 0],
                                        a = [(0, r._fn)(s[0]), (0, r._fn)(s[1])];
                                    if (!i.pocket && (i.position[0] !== a[0] || i.position[1] !== a[1])) {
                                        if ("cue" === e && t.draggingBall.active) continue;
                                        return console.warn("[DESYNC]", "Ball position is incorrect."), this.forceSync()
                                    }
                                }
                            }
                        },
                        forceSync() {
                            if (!this.game.data.id) return;
                            const t = this.$refs["poolField"],
                                e = t?.field?.physics;
                            if (e)
                                if (this.game.data.current.serverPhysics || this.game.data.host !== this.user.id) this.game.data.current.serverPhysics && (this.startNewRound(), this.updateTurn(), t.field && t.field.setDraggable(this.draggable), this.$store.dispatch("game/ACTION", {
                                    type: u().REQUEST_CURRENT
                                }));
                                else {
                                    const t = {
                                        balls: e.getBalls(),
                                        tracking: e.tracking,
                                        pocketed: e.getPocketedBalls()
                                    };
                                    this.$store.dispatch("game/ACTION", {
                                        type: u().GAME_STATE,
                                        data: t
                                    })
                                }
                        },
                        notification({
                            id: t,
                            type: e,
                            reason: i,
                            data: s,
                            duration: o = 5e3
                        }) {
                            const n = {
                                classes: void 0,
                                duration: o
                            };
                            if ("foul" === e || b.includes(i)) {
                                const o = "foul" === e,
                                    r = this.game.data.users[t],
                                    l = {
                                        ...s || {},
                                        name: `<b>${(0, a.Mn)({ user: this.user, data: r, selfText: this.$t("misc.you") })}</b>`
                                    };
                                for (const t in l) {
                                    const e = l[t];
                                    "object" === typeof e && e.key && (l[t] = this[e.count ? "$tc" : "$t"](e.key, e.data))
                                }
                                const h = (0, a.fy)(this.user, r);
                                o ? (n.type = "soft-warning", n.icon = "flag", this.$audio.preset("notification_foul")) : (n.type = "soft-info", this.$audio.preset("notification_info")), n.text = this.$t(`info.poolFoul.${h ? "self" : "other"}.${i}`, l)
                            } else if ("type" === e) {
                                const t = this.game.data.users[this.user.id];
                                if (!t.data.group) return;
                                if (n.type = "soft-info", t.localPlay) {
                                    const e = [];
                                    e.push(this.$t("misc.assignedTypeSelfLocal", {
                                        index: t.localPlay.id,
                                        type: `<b>${this.$t(`info.poolType.${t.data.group}`)}</b>`
                                    }));
                                    for (const i of t.localPlay.children) {
                                        const t = this.game.data.users[i];
                                        e.push(this.$t("misc.assignedTypeSelfLocal", {
                                            index: t.localPlay.id,
                                            type: `<b>${this.$t(`info.poolType.${t.data.group}`)}</b>`
                                        }))
                                    }
                                    n.text = e.join(" • ")
                                } else n.text = this.$t("misc.assignedTypeSelf", {
                                    type: `<b>${this.$t(`info.poolType.${t.data.group}`)}</b>`
                                });
                                this.$audio.preset("notification_info")
                            } else "info" === e && (n.type = "soft-info", n.text = this.$t(i), this.$audio.preset("notification_info"));
                            this.$event.$emit("toast", n)
                        },
                        reset() {
                            this.clearTimers(), this.stopRetryGameState(), this.startGame = !1, this.receivedHit = !1, this.hasHitBall = !1, this.balls = {}, this.hover.angle = null, this.hover.velocity = null, this.hover.draggingBall = null, this.hover.modifier = null, this.resetUpdateData(), this.$refs["poolField"]?.reset()
                        },
                        resetUpdateData() {
                            this.update.last = performance.now(), this.update.changes = [], this.update.data.angle = null, this.update.data.velocity = null, this.update.data.draggingBall = null, this.update.data.modifier = [null, null], delete this.update.data.ball
                        },
                        startNewRound() {
                            this.localTurnCount++, this.resetUpdateData(), this.hover.velocity = 0, this.hover.modifier = [0, 0], this.scheduleSyncCheck()
                        },
                        updateHover({
                            velocity: t,
                            angle: e,
                            modifier: i,
                            draggingBall: s,
                            ball: a
                        }) {
                            this.turn && !this.isTurn && (null != t && (this.hover.velocity = t), null != e && (this.hover.angle = e), null != s && (this.hover.draggingBall = s), null != i && (this.hover.modifier = i), null != a && this.$refs["poolField"].animateBall(a))
                        },
                        updateBalls(t = !1) {
                            (t || this.game.data.current.balls) && (this.hasHitBall && (this.hasHitBall = !1, !t) || (this.balls = JSON.parse(JSON.stringify(this.game.data.current.balls))))
                        },
                        hitBall({
                            id: t,
                            angle: e,
                            velocity: i,
                            modifier: s
                        }) {
                            t && t.includes(this.user.id) || this.$refs["poolField"]?.hitBall({
                                type: "cue",
                                angle: e,
                                velocity: i,
                                modifier: s
                            })
                        },
                        eventUpdateAngle(t) {
                            this.update.data.angle !== t && (this.update.data.angle = t, this.eventUpdate("angle"))
                        },
                        eventUpdateVelocity(t) {
                            this.update.data.velocity !== t && (this.update.data.velocity = t, this.eventUpdate("velocity"))
                        },
                        eventUpdateModifier(t) {
                            null != this.update.data.modifier && this.update.data.modifier[0] === t[0] && this.update.data.modifier[1] === t[1] || (this.update.data.modifier = t, this.eventUpdate("modifier"))
                        },
                        eventUpdateDraggingBall(t) {
                            this.update.data.draggingBall !== t && (this.update.data.draggingBall = t, this.eventUpdate("draggingBall"))
                        },
                        eventUpdateBall(t) {
                            this.update.data.ball = t, this.eventUpdate("ball")
                        },
                        eventUpdate(t = null) {
                            if (this.game.data.state !== d().IN_PROGRESS) return;
                            if (!this.turn || !this.isTurn || !this.game.data.id) return;
                            t ? this.update.changes.includes(t) || this.update.changes.push(t) : this.update.changes = Object.keys(this.update.data);
                            const e = performance.now() - this.update.last,
                                i = e > 255 ? 0 : 255 - e;
                            this.setTimer("preview_update", i, (() => {
                                if (!this.turn || !this.isTurn || !this.game.data.id) return;
                                const t = {};
                                for (const e of this.update.changes) t[e] = this.update.data[e];
                                this.$store.dispatch("game/ACTION", {
                                    type: u().HOVER,
                                    data: t
                                }), delete this.update.data.ball, this.update.last = performance.now(), this.update.changes = []
                            }))
                        },
                        eventHitBall({
                            angle: t,
                            velocity: e,
                            position: i,
                            modifier: s
                        }) {
                            if (!this.turn || !this.isTurn || !this.game.data.id) return;
                            const a = {
                                    angle: t,
                                    velocity: e,
                                    position: i,
                                    modifier: s
                                },
                                o = this.$refs["poolField"];
                            this.isBreaking && (a.seed = o?.field?.seed);
                            const n = o?.field?.physics;
                            n && (a.stateHash = (0, r.hashBallState)(n.getBalls())), this.hasHitBall = !0, this.$store.dispatch("game/ACTION", {
                                type: u().HIT_BALL,
                                data: a
                            })
                        },
                        updateHeader() {
                            const t = !!this.turn && this.isTurn;
                            switch (this.game.data.state) {
                                case d().PICKING:
                                    this.$store.dispatch("game/SET_HEADER", {
                                        hidden: !1,
                                        message: {
                                            key: "header.message." + (t ? "yourPick" : "namePick"),
                                            data: {
                                                extra: this.turn && this.turn.localPlay ? ` (${this.turn.localPlay.id})` : void 0,
                                                name: this.turn ? (0, a.Mn)({
                                                    user: this.user,
                                                    data: this.turn,
                                                    selfText: this.$t("misc.you")
                                                }) : void 0
                                            }
                                        },
                                        description: this.game.data.countdown.duration ? "header.description.remainingTimeCountdown" : ""
                                    });
                                    break;
                                case d().IN_PROGRESS:
                                    this.$store.dispatch("game/SET_HEADER", {
                                        hidden: !1,
                                        message: {
                                            key: `header.message.${t ? "yourTurn" : "nameTurn"}${this.isBreaking ? "Breaking" : ""}`,
                                            data: {
                                                extra: this.turn && this.turn.localPlay ? ` (${this.turn.localPlay.id})` : void 0,
                                                name: this.turn ? (0, a.Mn)({
                                                    user: this.user,
                                                    data: this.turn,
                                                    selfText: this.$t("misc.you")
                                                }) : void 0
                                            }
                                        },
                                        description: this.game.data.countdown.duration ? "header.description.remainingTimeCountdown" : ""
                                    });
                                    break;
                                case d().SIMULATING_PHYSICS:
                                    this.$store.dispatch("game/SET_HEADER", {
                                        hidden: !1,
                                        message: {
                                            key: `header.message.${t ? "yourTurn" : "nameTurn"}${this.isBreaking ? "Breaking" : ""}`,
                                            data: {
                                                extra: this.turn && this.turn.localPlay ? ` (${this.turn.localPlay.id})` : void 0,
                                                name: this.turn ? (0, a.Mn)({
                                                    user: this.user,
                                                    data: this.turn,
                                                    selfText: this.$t("misc.you")
                                                }) : void 0
                                            }
                                        },
                                        description: ""
                                    });
                                    break;
                                default:
                                    break
                            }
                        },
                        rematch() {
                            this.$store.dispatch("game/REMATCH")
                        },
                        updateTurn() {
                            this.turn && this.turn.id && (this.updateHeader(), this.game.data.state === d().IN_PROGRESS && this.canHitBall && this.schedulePostSimulationCueStickCheck())
                        },
                        updateGameState() {
                            switch (this.game.data.state) {
                                case d().IN_PROGRESS:
                                    this.hasHitBall = !1, this.receivedHit = !0, this.stopRetryGameState(), this.schedulePostSimulationCueStickCheck();
                                    break;
                                case d().SIMULATING_PHYSICS:
                                    this.clearTimer("post_simulation_cue_stick_check");
                                    break;
                                case d().FINISH:
                                case d().FINISH_REMATCH:
                                    this.stopRetryGameState(), this.clearTimer("post_simulation_cue_stick_check");
                                    break;
                                default:
                                    this.clearTimer("post_simulation_cue_stick_check");
                                    break
                            }
                        }
                    },
                    mounted() {
                        window.addEventListener("focus", this.scheduleSyncCheck), this.updateGameState(), this.updateHeader(), this.startNewRound(), this.updateBalls(), this.updateTurn()
                    },
                    beforeDestroy() {
                        window.removeEventListener("focus", this.scheduleSyncCheck)
                    }
                },
                k = w;
            var C, B, _ = i(81656),
                x = (0, _.A)(k, C, B, !1, null, null, null);
            const S = x.exports
        },
        14157: (t, e, i) => {
            i(86323), i(86323);
            const s = i(42953),
                a = {
                    [s.SOLID]: ["pool1", "pool2", "pool3", "pool4", "pool5", "pool6", "pool7"],
                    [s.STRIPE]: ["pool9", "pool10", "pool11", "pool12", "pool13", "pool14", "pool15"],
                    [s.EIGHT_BALL]: ["pool8"]
                },
                o = {
                    solverIterations: 20,
                    hole: {
                        radius: 11
                    },
                    ball: {
                        maxBreakAngleModifier: .6,
                        radius: 11,
                        shadowMaxOffset: .15,
                        physics: {
                            mass: 3,
                            damping: .45,
                            angularDamping: .9,
                            allowSleep: !0,
                            sleepSpeedLimit: 5,
                            gravityScale: 0
                        }
                    },
                    cueBall: {
                        spin: {
                            frictionOffset: .3,
                            restitutionOffset: .45,
                            maxAngleModifier: .25
                        },
                        physics: {
                            mass: 3,
                            damping: .45,
                            angularDamping: .9,
                            allowSleep: !0,
                            sleepSpeedLimit: 5,
                            gravityScale: 0
                        }
                    },
                    material: {
                        ballHitBall: {
                            friction: 1,
                            restitution: .9,
                            stiffness: 1e9
                        },
                        ballHitCushion: {
                            friction: 1,
                            restitution: .75,
                            stiffness: 1e9
                        },
                        cueballHitBall: {
                            friction: 1,
                            restitution: .9,
                            stiffness: 1e9
                        },
                        cueballHitCushion: {
                            friction: 1,
                            restitution: .75,
                            stiffness: 1e9
                        }
                    }
                },
                n = {
                    pull: {
                        distance: {
                            min: 1,
                            max: 100
                        },
                        velocity: {
                            min: 10,
                            max: 2e3
                        },
                        breakVelocity: {
                            min: 10,
                            max: 3500
                        }
                    }
                },
                r = {
                    thickness: 15,
                    width: 572,
                    height: 330,
                    size: 28,
                    cameraModifier: {
                        horizontal: .55,
                        horizontalSideControls: .62,
                        vertical: .57
                    },
                    walls: [],
                    wallDecorations: [],
                    wallHoles: [],
                    holes: [],
                    targetHoles: [],
                    cushions: []
                },
                l = o.hole.radius;
            r.targetHoles = [{
                x: r.width / 2 - l,
                y: r.height / 2 - l
            }, {
                x: 0,
                y: r.height / 2 - l / 2
            }, {
                x: -r.width / 2 + l,
                y: r.height / 2 - l
            }, {
                x: r.width / 2 - l,
                y: -r.height / 2 + l
            }, {
                x: 0,
                y: -r.height / 2 + l / 2
            }, {
                x: -r.width / 2 + l,
                y: -r.height / 2 + l
            }];
            const h = 55;
            r.cushions.push({
                id: "bottomLeft",
                size: 28,
                x: r.width / 4,
                y: r.height / 2 + r.thickness / 2,
                width: r.width / 2 - h,
                rotation: 0,
                left: "cornerSharp",
                right: "cornerHalf"
            }), r.cushions.push({
                id: "bottomRight",
                size: 28,
                x: -r.width / 4,
                y: r.height / 2 + r.thickness / 2,
                width: r.width / 2 - h,
                rotation: 0,
                left: "cornerHalf",
                right: "cornerSharp"
            }), r.cushions.push({
                id: "topLeft",
                size: 28,
                x: r.width / 4,
                y: -r.height / 2 - r.thickness / 2,
                width: r.width / 2 - h,
                rotation: Math.PI,
                left: "cornerHalf",
                right: "cornerSharp"
            }), r.cushions.push({
                id: "topRight",
                size: 28,
                x: -r.width / 4,
                y: -r.height / 2 - r.thickness / 2,
                width: r.width / 2 - h,
                rotation: Math.PI,
                left: "cornerSharp",
                right: "cornerHalf"
            }), r.cushions.push({
                id: "left",
                size: 28,
                x: -r.width / 2 - r.thickness / 2,
                y: 0,
                width: r.height - h,
                rotation: -Math.PI / 2,
                left: "cornerHalf",
                right: "cornerHalf"
            }), r.cushions.push({
                id: "right",
                size: 28,
                x: r.width / 2 + r.thickness / 2,
                y: 0,
                width: r.height - h,
                rotation: Math.PI / 2,
                left: "cornerHalf",
                right: "cornerHalf"
            }), r.holes.push({
                id: "bottomRight",
                angle: Math.atan2(-1, -1),
                x: r.width / 2 + .75 * o.hole.radius,
                y: r.height / 2 + .75 * o.hole.radius
            }), r.holes.push({
                id: "bottomLeft",
                angle: Math.atan2(-1, 1),
                x: -(r.width / 2 + .75 * o.hole.radius),
                y: r.height / 2 + .75 * o.hole.radius
            }), r.holes.push({
                id: "topRight",
                angle: Math.atan2(1, -1),
                x: r.width / 2 + .75 * o.hole.radius,
                y: -(r.height / 2 + .75 * o.hole.radius)
            }), r.holes.push({
                id: "topLeft",
                angle: Math.atan2(1, 1),
                x: -(r.width / 2 + .75 * o.hole.radius),
                y: -(r.height / 2 + .75 * o.hole.radius)
            }), r.holes.push({
                id: "middleBottom",
                angle: Math.atan2(-1, 0),
                x: 0,
                y: r.height / 2 + 1.75 * o.hole.radius
            }), r.holes.push({
                id: "middleTop",
                angle: Math.atan2(1, 0),
                x: 0,
                y: -(r.height / 2 + 1.75 * o.hole.radius)
            });
            const c = 28;
            r.walls.push({
                id: "top",
                width: 600,
                size: c,
                y: 192
            }), r.walls.push({
                id: "bottom",
                width: 600,
                size: c,
                y: -192,
                rotation: Math.PI
            }), r.walls.push({
                id: "left",
                width: 310,
                size: c,
                x: -299 - c / 2,
                rotation: -Math.PI / 2
            }), r.walls.push({
                id: "right",
                width: 310,
                size: c,
                x: 299 + c / 2,
                rotation: Math.PI / 2
            }), r.wallHoles.push({
                id: "topRight",
                type: "corner",
                size: c,
                x: -299,
                y: 192
            }), r.wallHoles.push({
                id: "topLeft",
                type: "corner",
                size: c,
                x: 299 + c / 2,
                y: 192 - c / 2,
                rotation: -Math.PI / 2
            }), r.wallHoles.push({
                id: "bottomRight",
                type: "corner",
                size: c,
                x: -299 - c / 2,
                y: c / 2 - 192,
                rotation: Math.PI / 2
            }), r.wallHoles.push({
                id: "bottomLeft",
                type: "corner",
                size: c,
                x: 299,
                y: -192,
                rotation: Math.PI
            }), r.wallHoles.push({
                id: "topCenter",
                type: "center",
                size: c,
                y: 192
            }), r.wallHoles.push({
                id: "bottomCenter",
                type: "center",
                size: c,
                y: -192,
                rotation: Math.PI
            });
            const d = {
                width: r.width / 8,
                height: r.height / 4
            };
            r.wallDecorations.push({
                size: c,
                y: 192,
                x: d.width
            }), r.wallDecorations.push({
                size: c,
                y: 192,
                x: 2 * d.width
            }), r.wallDecorations.push({
                size: c,
                y: 192,
                x: 3 * d.width
            }), r.wallDecorations.push({
                size: c,
                y: 192,
                x: -d.width
            }), r.wallDecorations.push({
                size: c,
                y: 192,
                x: 2 * -d.width
            }), r.wallDecorations.push({
                size: c,
                y: 192,
                x: 3 * -d.width
            }), r.wallDecorations.push({
                size: c,
                y: -192,
                x: d.width
            }), r.wallDecorations.push({
                size: c,
                y: -192,
                x: 2 * d.width
            }), r.wallDecorations.push({
                size: c,
                y: -192,
                x: 3 * d.width
            }), r.wallDecorations.push({
                size: c,
                y: -192,
                x: -d.width
            }), r.wallDecorations.push({
                size: c,
                y: -192,
                x: 2 * -d.width
            }), r.wallDecorations.push({
                size: c,
                y: -192,
                x: 3 * -d.width
            }), r.wallDecorations.push({
                size: c,
                y: 0,
                x: 299 + r.thickness
            }), r.wallDecorations.push({
                size: c,
                y: d.height,
                x: 299 + r.thickness
            }), r.wallDecorations.push({
                size: c,
                y: -d.height,
                x: 299 + r.thickness
            }), r.wallDecorations.push({
                size: c,
                y: 0,
                x: -(299 + r.thickness)
            }), r.wallDecorations.push({
                size: c,
                y: d.height,
                x: -(299 + r.thickness)
            }), r.wallDecorations.push({
                size: c,
                y: -d.height,
                x: -(299 + r.thickness)
            }), t.exports = {
                groups: a,
                config: o,
                inputConfig: n,
                fieldConfig: r
            }
        },
        27747: (t, e, i) => {
            i(86323), i(46831), i(86323), i(46831);
            const s = i(30765),
                a = i(48808),
                o = i(13500),
                n = i(80605),
                r = o.EIGHT_BALL_POOL,
                l = t => t.data.matchType === n.COMPUTER,
                h = (t, e) => `game.${t}.options.${e}`,
                c = (t, e, i = !1) => `\n\t\t<div class="chip-list large" ${i ? 'style="margin-top: -25px"' : ""}>\n\t\t\t<span class="white">${t(e)}</span>\n\t\t</div>`,
                d = t => t.map((t => ({
                    title: h(r, `foul.data.${t}`),
                    value: t
                }))),
                p = ({
                    min: t = 2,
                    max: e = 2
                } = {}) => ({
                    display: {
                        enabled: !1
                    },
                    editor: {
                        enabled: !1
                    },
                    hidden: l,
                    data: {
                        min: t,
                        max: e
                    }
                }),
                u = () => ({
                    title: h(r, "speed.title"),
                    help: [h(r, "speed.help")],
                    icon: "fa-duotone fa-person-running",
                    type: a.SELECT,
                    display: {
                        enabled: !0,
                        weight: 100
                    },
                    editor: {
                        enabled: !0,
                        weight: 100,
                        category: "category.misc"
                    },
                    data: [100, 125, 150, 175, 200, 250].map((t => ({
                        title: {
                            key: "misc.percentage",
                            data: {
                                percentage: t
                            }
                        },
                        value: t / 100
                    })))
                }),
                g = () => ({
                    title: h(r, "aimingLine.title"),
                    help: [h(r, "aimingLine.help")],
                    icon: "fa-duotone fa-magnifying-glass",
                    type: a.TOGGLE,
                    display: {
                        enabled: !0,
                        weight: 100
                    },
                    editor: {
                        enabled: !0,
                        weight: 80,
                        category: "category.misc"
                    },
                    data: {
                        allowed: [!0, !1]
                    },
                    warning: t => !t.data.config.aimingLine
                }),
                f = {
                    editor: {
                        enabled: !0
                    }
                },
                m = () => ({
                    display: {
                        enabled: !0,
                        weight: 100,
                        description: t => {
                            if (t.timeFreedomMode) return {
                                key: "game.generic.options.timeFreedomMode.data.off"
                            }
                        },
                        formatTime: s.TEXT
                    },
                    editor: {
                        enabled: !0,
                        weight: 80,
                        category: "category.times",
                        disabled: t => !!t.timeFreedomMode
                    },
                    hidden: l,
                    data: {
                        min: 3,
                        max: 120,
                        increment: 1
                    }
                }),
                y = () => [{
                    title: "game.generic.options.generic.data.required",
                    value: "required"
                }, {
                    title: "game.generic.options.generic.data.notRequired",
                    value: "notRequired"
                }],
                v = ({
                    warning: t
                } = {}) => ({
                    title: h(r, "ruleContactRailOnBreak.title"),
                    help: [h(r, "ruleContactRailOnBreak.help"), (t, e) => {
                        const i = h(r, "foul");
                        return "notRequired" === t.data.config.ruleContactRailOnBreak ? `${i}.help.disabled` : c(e, `${i}.data.resetHand`, !0)
                    }],
                    icon: "fa-duotone fa-border-outer",
                    type: a.SELECT,
                    display: {
                        enabled: !0,
                        weight: 90
                    },
                    editor: {
                        enabled: !0,
                        weight: 80,
                        category: "category.rules"
                    },
                    data: ["one", "two", "three", "four"].map((t => ({
                        title: h(r, `ruleContactRailOnBreak.data.${t}`),
                        value: t
                    }))).concat({
                        title: "game.generic.options.generic.data.notRequired",
                        value: "notRequired"
                    }),
                    ...t ? {
                        warning: t
                    } : {}
                }),
                b = ({
                    warning: t
                } = {}) => ({
                    title: h(r, "ruleTurnContactRail.title"),
                    help: [h(r, "ruleTurnContactRail.help"), (t, e) => {
                        const i = h(r, "foul");
                        return "notRequired" === t.data.config.ruleTurnContactRail ? `${i}.help.disabled` : c(e, `${i}.data.${t.data.config.foulTurnContactRail}`, !0)
                    }],
                    icon: "fa-duotone fa-border-right",
                    type: a.SELECT,
                    display: {
                        enabled: !0,
                        weight: 90
                    },
                    editor: {
                        enabled: !0,
                        weight: 80,
                        category: "category.rules"
                    },
                    data: y(),
                    ...t ? {
                        warning: t
                    } : {}
                }),
                w = ({
                    warning: t
                } = {}) => ({
                    title: h(r, "ruleTurnCanHitBall.title"),
                    help: [h(r, "ruleTurnCanHitBall.help"), (t, e) => {
                        const i = h(r, "foul");
                        return "anyBall" === t.data.config.ruleTurnCanHitBall ? `${i}.help.disabled` : c(e, `${i}.data.${t.data.config.foulTurnCanHitBall}`, !0)
                    }],
                    icon: "fa-ball-pile",
                    type: a.SELECT,
                    display: {
                        enabled: !0,
                        weight: 90
                    },
                    editor: {
                        enabled: !0,
                        weight: 80,
                        category: "category.rules"
                    },
                    data: ["assignedGroup", "assignedGroupPlus", "eitherGroup", "anyBall"].map((t => ({
                        title: h(r, `ruleTurnCanHitBall.data.${t}`),
                        value: t
                    }))),
                    ...t ? {
                        warning: t
                    } : {}
                }),
                k = ({
                    warning: t
                } = {}) => ({
                    title: h(r, "ruleTurnMustHitBall.title"),
                    help: [h(r, "ruleTurnMustHitBall.help"), (t, e) => {
                        const i = h(r, "foul");
                        return "notRequired" === t.data.config.ruleTurnMustHitBall ? `${i}.help.disabled` : c(e, `${i}.data.${t.data.config.foulTurnMustHitBall}`, !0)
                    }],
                    icon: "fa-duotone fa-crosshairs",
                    type: a.SELECT,
                    display: {
                        enabled: !0,
                        weight: 90
                    },
                    editor: {
                        enabled: !0,
                        weight: 80,
                        category: "category.rules"
                    },
                    data: y(),
                    ...t ? {
                        warning: t
                    } : {}
                }),
                C = () => ({
                    title: h(r, "ruleConsecutiveFouls.title"),
                    help: [h(r, "ruleConsecutiveFouls.help")],
                    icon: "fa-duotone fa-tally",
                    type: a.SELECT,
                    display: {
                        enabled: !0,
                        weight: 90
                    },
                    editor: {
                        enabled: !0,
                        weight: 80,
                        category: "category.rules"
                    },
                    data: ["off", "loseOnTwo", "loseOnThree", "loseOnFour"].map((t => ({
                        title: h(r, `ruleConsecutiveFouls.data.${t}`),
                        value: t
                    }))),
                    warning: t => "off" !== t.data.config.ruleConsecutiveFouls
                }),
                B = ({
                    types: t,
                    titleGameType: e = r
                } = {}) => ({
                    title: h(r, "illegalBallPocket.title"),
                    help: [(i, s) => {
                        const a = h(r, "foul"),
                            o = [];
                        for (const n of t || []) {
                            const t = "string" === typeof n ? {
                                    id: n,
                                    titleGameType: e
                                } : n,
                                r = s(h(t.titleGameType || e, `${t.id}.title`)),
                                l = c(s, `${a}.data.${i.data.config[t.id]}`);
                            o.push(`<div><b>${r}</b>${l}</div>`)
                        }
                        return `<div class="grid-container column-2">${o.join("")}</div>`
                    }],
                    helpClass: "large",
                    icon: "fa-duotone fa-pool-8-ball",
                    type: a.NONE,
                    display: {
                        enabled: !0,
                        weight: 100,
                        showExtra: 6
                    }
                }),
                _ = ({
                    id: t,
                    titleGameType: e = r,
                    helpGameType: i = e,
                    dataValues: s,
                    disabled: o
                }) => ({
                    title: h(e, `${t}.title`),
                    help: [h(i, `${t}.help`)],
                    icon: "fa-duotone fa-pool-8-ball",
                    type: a.SELECT,
                    display: {
                        enabled: !1
                    },
                    editor: {
                        enabled: !0,
                        weight: 80,
                        category: "category.fouls",
                        ...o ? {
                            disabled: o
                        } : {}
                    },
                    data: d(s),
                    warning: e => "instantLoss" === e.data.config[t]
                });
            t.exports = {
                buildFoulData: d,
                createAimingLineOption: g,
                createFoulOption: _,
                createIllegalBallPocketOption: B,
                createMaxUsersOption: p,
                createRuleConsecutiveFoulsOption: C,
                createRuleContactRailOnBreakOption: v,
                createRuleTurnCanHitBallOption: w,
                createRuleTurnContactRailOption: b,
                createRuleTurnMustHitBallOption: k,
                createSpeedOption: u,
                createTurnTimeOption: m,
                getFoulOutcome: c,
                timeFreedomModeOption: f,
                POOL_GAME_TYPE: r,
                GAME_TYPE: o
            }
        },
        93884: t => {
            t.exports = {
                CUE_BALL: Math.pow(2, 0),
                POOL_BALL: Math.pow(2, 1),
                CUSHION: Math.pow(2, 2),
                HOLE: Math.pow(2, 3),
                FIELD_BORDER: Math.pow(2, 4)
            }
        },
        42953: t => {
            t.exports = {
                SOLID: "SOLID",
                STRIPE: "STRIPE",
                EIGHT_BALL: "EIGHT_BALL",
                FREE: "FREE",
                RED: "RED",
                COLOR: "COLOR",
                YELLOW: "yellow",
                GREEN: "green",
                BROWN: "brown",
                BLUE: "blue",
                PINK: "pink",
                BLACK: "black",
                POOL1: "pool1",
                POOL2: "pool2",
                POOL3: "pool3",
                POOL4: "pool4",
                POOL5: "pool5",
                POOL6: "pool6",
                POOL7: "pool7",
                POOL8: "pool8",
                POOL9: "pool9"
            }
        },
        43653: t => {
            const e = (t = 0) => {
                    const e = 1e4 * t;
                    return (e >= 0 ? Math.floor(e + .5) : -Math.floor(.5 - e)) / 1e4
                },
                i = t => {
                    const e = Object.keys(t).sort();
                    let i = 5381;
                    for (const s of e) {
                        const e = t[s],
                            a = e.pocket ? 1 : 0,
                            o = a ? `${s}:P` : `${s}:${e.position[0]},${e.position[1]}`;
                        for (let t = 0; t < o.length; t++) i = (i << 5) + i + o.charCodeAt(t) | 0
                    }
                    return i
                };
            t.exports = {
                _fn: e,
                hashBallState: i
            }
        },
        16825: (t, e, i) => {
            i(86323), i(36166), i(94599), i(79191), i(86323), i(36166), i(94599), i(79191);
            const s = i(93884),
                {
                    isOutsideOfCircle: a
                } = i(39501),
                {
                    _fn: o
                } = i(43653),
                {
                    DRAG_SAFETY_GAP: n
                } = i(90601),
                r = !1;
            class l {
                constructor({
                    p2: t
                }, {
                    config: e,
                    fieldConfig: i,
                    speed: a,
                    seed: o
                }, {
                    collisionEvent: n,
                    sleepEvent: r,
                    wakeEvent: l,
                    pocketEvent: h,
                    unpocketEvent: c
                } = {}) {
                    this.p2 = t, this.config = e, this.fieldConfig = i, this.speed = a, this.seed = o || Math.random().toString().substring(2), this.noHitSpeedThreshold = this.config.ball.physics.sleepSpeedLimit + 2.5, this.break = {
                        check: !0,
                        index: 0
                    }, this.playing = !1, this.sleeping = !0, this.raycastResult = new this.p2.RaycastResult, this.raycast = new this.p2.Ray({
                        mode: this.p2.Ray.CLOSEST,
                        collisionMask: s.POOL_BALL | s.FIELD_BORDER
                    }), this.world = null, this.balls = {}, this.holes = {}, this.pocketed = {
                        balls: {},
                        positions: {}
                    }, this.material = {
                        ball: new this.p2.Material,
                        cueBall: new this.p2.Material,
                        cushion: new this.p2.Material
                    }, this.contactMaterial = {
                        ballHitCushion: null,
                        ballHitBall: null,
                        cueballHitCushion: null,
                        cueballHitBall: null
                    }, this.field = {
                        border: {},
                        cushion: {}
                    }, this.awake = [], this.event = {
                        collisionEvent: n,
                        sleepEvent: r,
                        wakeEvent: l,
                        pocketEvent: h,
                        unpocketEvent: c
                    }, this.tracking = {
                        durationInMs: null,
                        lastBallPocketDelta: null,
                        firstBallHit: null,
                        softFirstBallHit: null,
                        pocket: [],
                        cushionHit: []
                    }, this.cueBallModifier = [0, 0], this.stepDt = 1 / 240, this.stepCount = 0, this.simulationCalculationTime = 0, this.frameCount = 0, this.collisionFrames = [], this.pocketFrames = [], this._ballTypes = [], this._boundCollisionHandler = this._handleCollisionEvent.bind(this), this.init()
                }
                init() {
                    this.world = new this.p2.World({
                        gravity: [0, 0],
                        islandSplit: !1
                    }), this.world.sleepMode = this.p2.World.BODY_SLEEPING, this.world.applyGravity = !1, this.world.applySpringForces = !1, this.world.emitImpactEvent = !0, this.world.useFrictionGravityOnZeroGravity = !1, this.world.useWorldGravityAsFrictionGravity = !1, this.world.solver.iterations = this.config.solverIterations ?? 5, this.world.solver.tolerance = .01, this.world.solver.frictionIterations = !1, this.world.setGlobalStiffness(1e8), this.world.step(0), this.contactMaterial.ballHitCushion = new this.p2.ContactMaterial(this.material.ball, this.material.cushion, this.config.material.ballHitCushion), this.world.addContactMaterial(this.contactMaterial.ballHitCushion), this.contactMaterial.ballHitBall = new this.p2.ContactMaterial(this.material.ball, this.material.ball, this.config.material.ballHitBall), this.world.addContactMaterial(this.contactMaterial.ballHitBall), this.contactMaterial.cueballHitCushion = new this.p2.ContactMaterial(this.material.cueBall, this.material.cushion, this.config.material.cueballHitCushion), this.world.addContactMaterial(this.contactMaterial.cueballHitCushion), this.contactMaterial.cueballHitBall = new this.p2.ContactMaterial(this.material.cueBall, this.material.ball, this.config.material.cueballHitBall), this.world.addContactMaterial(this.contactMaterial.cueballHitBall);
                    for (const t of this.fieldConfig.cushions) this.addCushion(t);
                    for (const t of this.fieldConfig.holes) this.addHole(t);
                    this.initFieldBorder(), this.world.on("impact", this._boundCollisionHandler)
                }
                _prepareBallTypes() {
                    this._ballTypes = Object.keys(this.balls), this._ballCount = this._ballTypes.length
                }
                runSimulation() {
                    const t = performance.now(),
                        e = 8e4;
                    this.world.time = 0, this.world.accumulator = 0, this._prepareBallTypes();
                    const i = 4 * this._ballCount;
                    this._frameBuffer = new Float64Array(e * i), this.collisionFrames = [], this.pocketFrames = [], this.stepCount = 0, this.sleeping = !1, r && console.info("Starting simulation... Break enabled?", this.break.check);
                    while (this.stepCount < e && !this.sleeping) this._recordFrameFlat(), this.world.step(this.stepDt), this.stepCount++;
                    if (this._recordFrameFlat(), this.frameCount = this.stepCount + 1, this._frameBuffer = this._frameBuffer.subarray(0, this.frameCount * i), this.pocketFrames.length) {
                        const t = this.pocketFrames[this.pocketFrames.length - 1];
                        this.tracking.lastBallPocketDelta = o(t.frame / this.frameCount)
                    }
                    this.tracking.durationInMs = this.getPlaybackDuration(), this._checkForMissedPocketedBalls(), this.applyFinalState(), this.stepTotalDurationInMs = performance.now() - t, r && console.info("Finished simulation! (Steps:", this.stepCount, ") (Took", this.simulationCalculationTime, "ms)"), this.event.sleepEvent && this.event.sleepEvent()
                }
                applyFinalState() {
                    for (const t in this.balls) {
                        const e = this.balls[t];
                        e.position[0] = o(e.position[0]), e.position[1] = o(e.position[1]), e.previousPosition[0] = e.position[0], e.previousPosition[1] = e.position[1], e.angle = o(e.angle), e.previousAngle = e.angle, e.velocity[0] = 0, e.velocity[1] = 0, e.force[0] = 0, e.force[1] = 0
                    }
                }
                _recordFrameFlat() {
                    const t = this.stepCount * this._ballCount * 4;
                    for (let e = 0; e < this._ballCount; e++) {
                        const i = this.balls[this._ballTypes[e]],
                            s = t + 4 * e;
                        this._frameBuffer[s] = i.position[0], this._frameBuffer[s + 1] = i.position[1], this._frameBuffer[s + 2] = i.angle, this._frameBuffer[s + 3] = this.pocketed.balls[this._ballTypes[e]] ? 1 : 0
                    }
                }
                getFrameAtProgress(t) {
                    if (!this.frameCount) return null;
                    const e = Math.max(0, Math.min(1, t)),
                        i = this.frameCount - 1,
                        s = e * i,
                        a = Math.floor(s),
                        n = s - a,
                        r = 4 * this._ballCount,
                        l = {};
                    if (0 === n || a >= i) {
                        const t = Math.min(a, i) * r;
                        for (let e = 0; e < this._ballCount; e++) {
                            const i = t + 4 * e,
                                s = this._ballTypes[e];
                            l[s] = {
                                position: [o(this._frameBuffer[i]), o(this._frameBuffer[i + 1])],
                                angle: o(this._frameBuffer[i + 2]),
                                pocket: 1 === this._frameBuffer[i + 3]
                            }
                        }
                        return l
                    }
                    const h = a * r,
                        c = (a + 1) * r;
                    for (let d = 0; d < this._ballCount; d++) {
                        const t = h + 4 * d,
                            e = c + 4 * d,
                            i = this._ballTypes[d];
                        if (1 === this._frameBuffer[e + 3]) l[i] = {
                            position: [o(this._frameBuffer[e]), o(this._frameBuffer[e + 1])],
                            angle: o(this._frameBuffer[e + 2]),
                            pocket: !0
                        };
                        else {
                            const s = this._frameBuffer[t],
                                a = this._frameBuffer[t + 1],
                                r = this._frameBuffer[e],
                                h = this._frameBuffer[e + 1],
                                c = this._frameBuffer[t + 2],
                                d = this._frameBuffer[e + 2];
                            l[i] = {
                                position: [o(s + (r - s) * n), o(a + (h - a) * n)],
                                angle: o(c + (d - c) * n),
                                pocket: !1
                            }
                        }
                    }
                    return l
                }
                getFrameCount() {
                    return this.frameCount || 0
                }
                getPlaybackDuration() {
                    return (this.frameCount || 0) * this.stepDt * 1e3
                }
                _formatFrame(t) {
                    const e = {};
                    for (const i in t) e[i] = {
                        position: [o(t[i].position[0]), o(t[i].position[1])],
                        angle: o(t[i].angle),
                        pocket: t[i].pocket
                    };
                    return e
                }
                safeSpotCheck({
                    type: t = "cue",
                    x: e,
                    y: i,
                    circle: s,
                    safetyGap: o = n,
                    areaMaxX: r = this.fieldConfig.width / 2,
                    areaMinX: l = -this.fieldConfig.width / 2,
                    areaMaxY: h = this.fieldConfig.height / 2,
                    areaMinY: c = -this.fieldConfig.height / 2
                }) {
                    const d = this.config.ball.radius,
                        p = d + o;
                    if (s) {
                        const t = a({
                            x: e,
                            y: i
                        }, {
                            x: s.x,
                            y: s.y
                        }, Math.max(s.radius - o, 0));
                        if (t) return !1
                    }
                    if (e + p > r || e - p < l) return !1;
                    if (i + p > h || i - p < c) return !1;
                    for (const a in this.balls) {
                        if (a === t) continue;
                        const s = this.balls[a],
                            o = this._circleIntersectTest({
                                x: s.position[0],
                                y: s.position[1],
                                radius: d
                            }, {
                                x: e,
                                y: i,
                                radius: p
                            });
                        if (o) return !1
                    }
                    return !0
                }
                pocketBall(t, e) {
                    if (this.pocketed.balls[t]) return;
                    const i = this.balls[t],
                        s = this.config.ball.radius,
                        a = Object.keys(this.balls).length,
                        o = [i.position[0], i.position[1]];
                    for (let n = 0; n < a; n++) {
                        if (this.pocketed.positions[n]) continue;
                        this.pocketed.positions[n] = t;
                        const e = n * (2 * s);
                        i.velocity[0] = 0, i.velocity[1] = 0, i.position[0] = 1e4 + e, i.position[1] = 1e4, this.pocketed.balls[t] = i, i.sleep();
                        break
                    }
                    this.pocketFrames.push({
                        frame: this.stepCount,
                        type: t,
                        id: e,
                        position: o
                    }), this.event.pocketEvent && this.event.pocketEvent({
                        type: t,
                        id: e,
                        position: o
                    })
                }
                unpocketBall(t) {
                    if (this.pocketed.balls[t]) {
                        for (const e in this.pocketed.positions) {
                            const i = this.pocketed.positions[e];
                            i === t && (delete this.pocketed.positions[e], delete this.pocketed.balls[i])
                        }
                        this.event.unpocketEvent && this.event.unpocketEvent({
                            type: t
                        })
                    }
                }
                pocketReset() {
                    this.pocketed.balls = {}, this.pocketed.positions = {}
                }
                hitBall({
                    type: t = "cue",
                    angle: e = 0,
                    velocity: i = 100,
                    modifier: s = [0, 0],
                    position: a
                } = {}) {
                    if (!this.balls[t]) return;
                    const n = this.getBalls();
                    if (Array.isArray(a) && 2 === a.length && (n[t] = {
                            ...n[t] || {},
                            pocket: !1,
                            position: [o(a[0]), o(a[1])]
                        }), this.updateBalls(n), "cue" === t) {
                        this.cueBallModifier = s;
                        const t = s[1],
                            e = {
                                friction: this.config.cueBall.spin.frictionOffset * t,
                                restitution: this.config.cueBall.spin.restitutionOffset * t
                            },
                            i = this.config.material,
                            a = this.contactMaterial;
                        a.cueballHitCushion.friction = i.cueballHitCushion.friction + e.friction, a.cueballHitCushion.restitution = i.cueballHitCushion.restitution + e.restitution, a.cueballHitBall.friction = i.cueballHitBall.friction + e.friction, a.cueballHitBall.restitution = i.cueballHitBall.restitution + e.restitution
                    }
                    this.clearTrackingData(), this.balls[t].wakeUp(), this.balls[t].applyImpulse([o(i * Math.cos(e)), o(i * Math.sin(e))]), this._trackAwakeBody(t), this.runSimulation()
                }
                getPocketedBalls() {
                    return Object.keys(this.pocketed.balls)
                }
                getBalls() {
                    const t = {};
                    for (const e in this.balls) {
                        const i = this.balls[e];
                        t[e] = {
                            pocket: !!this.pocketed.balls[e],
                            position: [o(i.position[0]), o(i.position[1])],
                            angle: o(i.angle)
                        }
                    }
                    return t
                }
                sleep() {
                    for (const t in this.balls) this.updateBall({
                        type: t,
                        data: {}
                    })
                }
                updateBalls(t) {
                    for (const e in t) this.updateBall({
                        type: e,
                        data: t[e]
                    })
                }
                updateBall({
                    type: t,
                    data: e
                }) {
                    const i = this.balls[t];
                    i && (i.sleep(), e.pocket ? this.pocketBall(t) : (this.unpocketBall(t), null != e.angle && (i.angle = e.angle, i.previousAngle = e.angle, i.interpolatedAngle = e.angle), null != e.position && (i.position[0] = e.position[0], i.position[1] = e.position[1], i.previousPosition[0] = e.position[0], i.previousPosition[1] = e.position[1]), i.force[0] = 0, i.force[1] = 0, i.velocity[0] = 0, i.velocity[1] = 0, i.sleep()))
                }
                initFieldBorder() {
                    const t = 50;
                    this.field.border["north"] = new this.p2.Body({
                        position: [0, -this.fieldConfig.height / 2 - t / 2]
                    }), this.field.border["north"].addShape(new this.p2.Box({
                        width: this.fieldConfig.width + 2 * t,
                        height: t,
                        collisionGroup: s.FIELD_BORDER
                    })), this.field.border["north"]._type = "north", this.field.border["south"] = new this.p2.Body({
                        position: [0, this.fieldConfig.height / 2 + t / 2]
                    }), this.field.border["south"].addShape(new this.p2.Box({
                        width: this.fieldConfig.width + 2 * t,
                        height: t,
                        collisionGroup: s.FIELD_BORDER
                    })), this.field.border["south"]._type = "south", this.field.border["east"] = new this.p2.Body({
                        position: [this.fieldConfig.width / 2 + t / 2, 0]
                    }), this.field.border["east"].addShape(new this.p2.Box({
                        width: t,
                        height: this.fieldConfig.height + 2 * t,
                        collisionGroup: s.FIELD_BORDER
                    })), this.field.border["east"]._type = "east", this.field.border["west"] = new this.p2.Body({
                        position: [-this.fieldConfig.width / 2 - t / 2, 0]
                    }), this.field.border["west"].addShape(new this.p2.Box({
                        width: t,
                        height: this.fieldConfig.height + 2 * t,
                        collisionGroup: s.FIELD_BORDER
                    })), this.field.border["west"]._type = "west", this.world.addBody(this.field.border["north"]), this.world.addBody(this.field.border["south"]), this.world.addBody(this.field.border["east"]), this.world.addBody(this.field.border["west"])
                }
                addCushion({
                    id: t,
                    x: e,
                    y: i,
                    width: a,
                    rotation: o = 0,
                    left: n,
                    right: r
                }) {
                    const l = this.fieldConfig.thickness;
                    this.field.cushion[t] = new this.p2.Body({
                        position: [e, i],
                        angle: o
                    }), this.field.cushion[t]._type = "cushion";
                    const h = () => {
                        this.field.cushion[t].addShape(new this.p2.Box({
                            width: a,
                            height: l,
                            collisionGroup: s.CUSHION,
                            collisionMask: s.POOL_BALL | s.CUE_BALL,
                            material: this.material.cushion
                        }))
                    };

                    function c(t) {
                        return (t + Math.PI) % (2 * Math.PI)
                    }
                    const d = (e, i) => {
                        const n = "left" === i,
                            r = .5 === Math.abs(o / Math.PI) ? 1 : -1;
                        let h = 0;
                        h = 1 === r ? "cornerSharp" === e ? Math.PI / 2 + Math.PI / 8 : Math.PI - Math.PI / 4 : "cornerSharp" === e ? -Math.PI / 8 : -Math.PI / 4;
                        const d = c(n ? -h : h),
                            p = new this.p2.Box({
                                width: 2 * l,
                                height: 2 * l,
                                material: this.material.cushion,
                                collisionGroup: s.CUSHION,
                                collisionMask: s.POOL_BALL | s.CUE_BALL
                            });
                        this.field.cushion[t].addShape(p), p.angle = d;
                        const u = {
                                x: a / 2 * (n ? -1 : 1),
                                y: r * (l / 2)
                            },
                            g = this._getDistance({
                                x: 0,
                                y: 0
                            }, {
                                x: l,
                                y: l
                            }),
                            f = (n ? -1 : 1) * (l + a / 2),
                            m = d + (n ? -1 : 1) * Math.PI / 4,
                            y = {
                                x: f - g * Math.sin(m),
                                y: g * Math.cos(m) + 3 * r
                            },
                            v = {
                                x: u.x - y.x,
                                y: u.y - y.y
                            };
                        p.position[0] = f + v.x, p.position[1] = v.y
                    };
                    h(), d(n, "left"), d(r, "right"), this.world.addBody(this.field.cushion[t])
                }
                addHole({
                    id: t,
                    x: e = 0,
                    y: i = 0
                } = {}) {
                    this.holes[t] = new this.p2.Body({
                        position: [e, i],
                        collisionMask: s.POOL_BALL | s.CUE_BALL | s.CUSHION,
                        mass: 0
                    }), this.holes[t]._type = "hole", this.holes[t]._id = t, this.holes[t].addShape(new this.p2.Circle({
                        radius: this.config.hole.radius,
                        collisionGroup: s.HOLE,
                        collisionMask: s.POOL_BALL | s.CUE_BALL
                    })), this.world.addBody(this.holes[t])
                }
                addBall({
                    type: t = "cue",
                    x: e = 0,
                    y: i = 0,
                    pocket: a = !1
                } = {}) {
                    if (this.balls[t]) return;
                    const o = "cue" === t ? "cueBall" : "ball";
                    this.balls[t] = new this.p2.Body({
                        position: [e, i],
                        ...this.config[o].physics
                    }), this.balls[t]._type = t, this.balls[t].addShape(new this.p2.Circle({
                        radius: this.config.ball.radius,
                        collisionGroup: "cue" === t ? s.CUE_BALL : s.POOL_BALL,
                        collisionMask: s.POOL_BALL | s.CUE_BALL | s.CUSHION | s.HOLE,
                        material: this.material[o]
                    })), this.balls[t].on("wakeup", (() => this._trackAwakeBody(t))), this.balls[t].on("sleep", (() => this._trackSleepingBody(t))), this.world.addBody(this.balls[t]), a && this.pocketBall(t)
                }
                clearTrackingData() {
                    this.tracking.durationInMs = null, this.tracking.lastBallPocketDelta = null, this.tracking.firstBallHit = null, this.tracking.softFirstBallHit = null, this.tracking.pocket.length = 0, this.tracking.cushionHit.length = 0
                }
                trackBallHit(t) {
                    !this.tracking.firstBallHit && this.balls[t._type] && (this.tracking.firstBallHit = t._type)
                }
                trackSoftBallHit(t) {
                    !this.tracking.softFirstBallHit && this.balls[t._type] && (this.tracking.softFirstBallHit = t._type)
                }
                trackCushionHit(t) {
                    this.tracking.cushionHit.includes(t._type) || this.tracking.cushionHit.push(t._type)
                }
                trackPocket(t) {
                    this.tracking.pocket.includes(t._type) || this.tracking.pocket.push(t._type)
                }
                _handleCollisionEvent(t) {
                    const e = ["bodyA", "bodyB"],
                        i = t[e[0]],
                        s = t[e[1]],
                        a = i?._type,
                        n = s?._type;
                    if (this.balls[a] && this.balls[n]) {
                        if (this.break.check) {
                            const t = Number(this.seed[this.break.index % this.seed.length]),
                                e = this.config.ball.maxBreakAngleModifier,
                                i = o(e * (t / 5 - 1));
                            this._modifyAngle(s, i), this.break.index++
                        }
                        const i = this.balls[a].velocity,
                            r = this.balls[n].velocity;
                        if ("cue" === a || "cue" === n) {
                            const i = "cue" === a ? 0 : 1,
                                s = 0 === i ? 1 : 0,
                                o = this.balls[t[e[s]]._type],
                                n = Math.abs(o.velocity[0]) + Math.abs(o.velocity[1]);
                            if (this.trackSoftBallHit(o), n < this.noHitSpeedThreshold) return
                        }
                        const l = this._getDistance({
                            x: i[0],
                            y: i[1]
                        }, {
                            x: r[0],
                            y: r[1]
                        });
                        this.collisionFrames.push({
                            frame: this.stepCount,
                            velocity: l,
                            type: "ball"
                        })
                    }
                    for (const r of e) {
                        const i = t[r],
                            s = t[e[r === e[0] ? 1 : 0]];
                        switch (i._type) {
                            case "cue": {
                                this.trackBallHit(s);
                                const t = this.config.cueBall.spin,
                                    e = o(t.maxAngleModifier * this.cueBallModifier[0]);
                                this._modifyAngle(i, e);
                                const a = this.config.material,
                                    n = this.contactMaterial;
                                n.cueballHitCushion.friction = a.cueballHitCushion.friction, n.cueballHitCushion.restitution = a.cueballHitCushion.restitution, n.cueballHitBall.friction = a.cueballHitBall.friction, n.cueballHitBall.restitution = a.cueballHitBall.restitution, this.cueBallModifier = [0, 0];
                                break
                            }
                            case "hole": {
                                const t = s;
                                this.trackPocket(t), this.pocketBall(t._type, i._id);
                                break
                            }
                            case "cushion": {
                                const t = s;
                                this.trackCushionHit(t);
                                const e = this._getDistance({
                                    x: 0,
                                    y: 0
                                }, {
                                    x: t.velocity[0],
                                    y: t.velocity[1]
                                });
                                this.collisionFrames.push({
                                    frame: this.stepCount,
                                    velocity: e,
                                    type: "cushion"
                                });
                                break
                            }
                            default:
                                break
                        }
                    }
                }
                _checkForMissedPocketedBalls() {
                    const t = Object.keys(this.holes)[0],
                        e = 2 * this.config.ball.radius,
                        i = this.fieldConfig.height / 2 + e,
                        s = this.fieldConfig.width / 2 + e;
                    for (const a in this.balls) {
                        if (this.pocketed.balls[a]) continue;
                        const e = this.balls[a];
                        (Math.abs(e.position[0]) > s || Math.abs(e.position[1]) > i) && (this.trackPocket(e), this.pocketBall(a, t))
                    }
                }
                _trackAwakeBody(t) {
                    this.awake.includes(t) || (this.awake.push(t), this.sleeping && (this.sleeping = !1, this.event.wakeEvent && this.event.wakeEvent()))
                }
                _trackSleepingBody(t) {
                    this.awake.includes(t) && (this.awake.splice(this.awake.indexOf(t), 1), 0 === this.awake.length && (this.sleeping = !0))
                }
                setSeed(t) {
                    this.seed = t
                }
                setSpeed(t) {
                    this.speed = t
                }
                setBreaking(t) {
                    this.break.check = t, this.break.index = 0, r && console.info("Break has been set!", t)
                }
                play() {
                    this.playing = !0
                }
                stop() {
                    this.playing = !1
                }
                destroy() {
                    this.world.off("impact", this._boundCollisionHandler), this.stop(), this.world.clear()
                }
                _modifyAngle(t, e = 0) {
                    if (0 === e || !Number(e)) return;
                    const i = o(Math.atan2(t.velocity[1], t.velocity[0]) - e),
                        s = o(this._getVelocity(t.velocity));
                    t.velocity[0] = o(s * o(Math.cos(i))), t.velocity[1] = o(s * o(Math.sin(i)))
                }
                _circleIntersectTest(t, e) {
                    const i = Math.abs(t.x - e.x),
                        s = Math.abs(t.y - e.y),
                        a = Math.hypot(i, s),
                        o = a > t.radius + e.radius,
                        n = !o && e.radius > t.radius + a,
                        r = !o && t.radius > e.radius + a;
                    return !(o || n || r)
                }
                _getDistance(t, e) {
                    return Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2))
                }
                _getVelocity(t) {
                    return Math.sqrt(Math.pow(t[0], 2) + Math.pow(t[1], 2))
                }
            }
            t.exports = l
        },
        90601: t => {
            t.exports = {
                DRAG_SAFETY_GAP: .1
            }
        },
        72101: (t, e, i) => {
            i(86323);
            var s = i(86399)["default"];
            i(86323);
            const a = Array,
                o = (t, e) => {
                    for (let i = 0, s = e.length; i !== s; ++i) t.push(e[i])
                },
                n = (t, e) => {
                    const i = t.indexOf(e);
                    if (-1 !== i) {
                        const e = t.length - 1;
                        for (let s = i; s < e; s++) t[s] = t[s + 1];
                        t.length = e
                    }
                };

            function r(t, e) {
                return t[0] * e[1] - t[1] * e[0]
            }

            function l(t, e, i) {
                return c(t, e, -Math.PI / 2), C(t, t, i), t
            }

            function h(t, e, i) {
                return c(t, i, Math.PI / 2), C(t, t, e), t
            }

            function c(t, e, i) {
                if (0 !== i) {
                    const s = Math.cos(i),
                        a = Math.sin(i),
                        o = e[0],
                        n = e[1];
                    t[0] = s * o - a * n, t[1] = a * o + s * n
                } else t[0] = e[0], t[1] = e[1];
                return t
            }

            function d(t, e) {
                const i = e[0],
                    s = e[1];
                return t[0] = s, t[1] = -i, t
            }

            function p(t, e, i, s) {
                const a = Math.cos(-s),
                    o = Math.sin(-s),
                    n = e[0] - i[0],
                    r = e[1] - i[1];
                return t[0] = a * n - o * r, t[1] = o * n + a * r, t
            }

            function u(t, e, i, s) {
                const a = Math.cos(s),
                    o = Math.sin(s),
                    n = e[0],
                    r = e[1];
                t[0] = a * n - o * r + i[0], t[1] = o * n + a * r + i[1]
            }

            function g() {
                const t = new a(2);
                return t[0] = 0, t[1] = 0, t
            }

            function f(t) {
                const e = new a(2);
                return e[0] = t[0], e[1] = t[1], e
            }

            function m(t, e) {
                const i = new a(2);
                return i[0] = t, i[1] = e, i
            }

            function y(t, e) {
                return t[0] = e[0], t[1] = e[1], t
            }

            function v(t, e, i) {
                return t[0] = e, t[1] = i, t
            }

            function b(t, e, i) {
                return t[0] = e[0] + i[0], t[1] = e[1] + i[1], t
            }

            function w(t, e, i) {
                return t[0] = e[0] - i[0], t[1] = e[1] - i[1], t
            }

            function k(t, e, i) {
                return t[0] = e[0] * i[0], t[1] = e[1] * i[1], t
            }

            function C(t, e, i) {
                return t[0] = e[0] * i, t[1] = e[1] * i, t
            }

            function B(t, e) {
                const i = e[0] - t[0],
                    s = e[1] - t[1];
                return Math.sqrt(i * i + s * s)
            }

            function _(t, e) {
                const i = e[0] - t[0],
                    s = e[1] - t[1];
                return i * i + s * s
            }

            function x(t) {
                return Math.sqrt(t[0] * t[0] + t[1] * t[1])
            }

            function S(t) {
                return t[0] * t[0] + t[1] * t[1]
            }

            function M(t, e) {
                const i = e[0],
                    s = e[1];
                let a = i * i + s * s;
                return a > 0 && (a = 1 / Math.sqrt(a), t[0] = e[0] * a, t[1] = e[1] * a), t
            }

            function P(t, e) {
                return t[0] * e[0] + t[1] * e[1]
            }

            function E(t, e, i, s) {
                const a = e[0],
                    o = e[1];
                return t[0] = a + s * (i[0] - a), t[1] = o + s * (i[1] - o), t
            }

            function A(t, e, i, s) {
                const a = e[0] - t[0],
                    o = e[1] - t[1],
                    n = s[0] - i[0],
                    r = s[1] - i[1],
                    l = -n * o + a * r;
                if (0 === l) return -1;
                const h = (-o * (t[0] - i[0]) + a * (t[1] - i[1])) / l,
                    c = (n * (t[1] - i[1]) - r * (t[0] - i[0])) / l;
                return h >= 0 && h <= 1 && c >= 0 && c <= 1 ? c : -1
            }
            const L = {
                crossLength: r,
                crossVZ: l,
                crossZV: h,
                rotate: c,
                rotate90cw: d,
                toLocalFrame: p,
                toGlobalFrame: u,
                create: g,
                clone: f,
                fromValues: m,
                copy: y,
                set: v,
                add: b,
                subtract: w,
                multiply: k,
                scale: C,
                distance: B,
                squaredDistance: _,
                length: x,
                squaredLength: S,
                normalize: M,
                dot: P,
                lerp: E,
                getLineSegmentsIntersectionFraction: A
            };
            class T {
                constructor(t = {}) {
                    this.lowerBound = t.lowerBound ? f(t.lowerBound) : g(), this.upperBound = t.upperBound ? f(t.upperBound) : g()
                }
                setFromPoints(t, e, i = 0, s = 0) {
                    const a = this.lowerBound,
                        o = this.upperBound;
                    0 !== i ? c(a, t[0], i) : y(a, t[0]), y(o, a);
                    const n = Math.cos(i),
                        r = Math.sin(i),
                        l = g();
                    for (let h = 1; h < t.length; h++) {
                        let e = t[h];
                        0 !== i && (l[0] = n * e[0] - r * e[1], l[1] = r * e[0] + n * e[1], e = l), e[0] > o[0] && (o[0] = e[0]), e[1] > o[1] && (o[1] = e[1]), e[0] < a[0] && (a[0] = e[0]), e[1] < a[1] && (a[1] = e[1])
                    }
                    e && (b(a, a, e), b(o, o, e)), s && (a[0] -= s, a[1] -= s, o[0] += s, o[1] += s)
                }
                copy(t) {
                    y(this.lowerBound, t.lowerBound), y(this.upperBound, t.upperBound)
                }
                extend(t) {
                    const e = this.lowerBound,
                        i = this.upperBound;
                    e[0] > t.lowerBound[0] && (e[0] = t.lowerBound[0]), e[1] > t.lowerBound[1] && (e[1] = t.lowerBound[1]), i[0] < t.upperBound[0] && (i[0] = t.upperBound[0]), i[1] < t.upperBound[1] && (i[1] = t.upperBound[1])
                }
                overlaps(t) {
                    const e = this.lowerBound,
                        i = this.upperBound,
                        s = t.lowerBound,
                        a = t.upperBound;
                    return (s[0] <= i[0] && i[0] <= a[0] || e[0] <= a[0] && a[0] <= i[0]) && (s[1] <= i[1] && i[1] <= a[1] || e[1] <= a[1] && a[1] <= i[1])
                }
                containsPoint(t) {
                    const e = this.lowerBound,
                        i = this.upperBound;
                    return e[0] <= t[0] && t[0] <= i[0] && e[1] <= t[1] && t[1] <= i[1]
                }
                overlapsRay(t) {
                    const e = 1 / t.direction[0],
                        i = 1 / t.direction[1],
                        s = t.from,
                        a = this.lowerBound,
                        o = this.upperBound,
                        n = (a[0] - s[0]) * e,
                        r = (o[0] - s[0]) * e,
                        l = (a[1] - s[1]) * i,
                        h = (o[1] - s[1]) * i,
                        c = Math.max(Math.min(n, r), Math.min(l, h)),
                        d = Math.min(Math.max(n, r), Math.max(l, h));
                    return d < 0 || c > d ? -1 : c / t.length
                }
            }
            class $ {
                constructor() {
                    s(this, "listeners", {})
                }
                on(t, e) {
                    let i = this.listeners[t];
                    return i || (i = [], this.listeners[t] = i), -1 === i.indexOf(e) && i.push(e), this
                }
                off(t, e) {
                    const i = this.listeners[t];
                    if (i) {
                        const t = i.indexOf(e); - 1 !== t && i.splice(t, 1)
                    }
                    return this
                }
                has(t) {
                    return void 0 !== this.listeners[t]
                }
                emit(t) {
                    if (!this.listeners) return this;
                    const e = this.listeners[t.type];
                    if (e)
                        for (const i of [...e]) i(t);
                    return this
                }
            }
            class I {
                constructor(t = {}) {
                    this.from = t.from ? f(t.from) : g(), this.to = t.to ? f(t.to) : g(), this.checkCollisionResponse = t.checkCollisionResponse ?? !0, this.skipBackfaces = !!t.skipBackfaces, this.collisionMask = t.collisionMask ?? -1, this.collisionGroup = t.collisionGroup ?? -1, this.mode = t.mode ?? I.ANY, this.callback = t.callback || function() {}, this.direction = g(), this.length = 1, this._currentBody = null, this._currentShape = null, this.update()
                }
                update() {
                    const t = this.direction;
                    w(t, this.to, this.from), this.length = x(t), M(t, t)
                }
                intersectBodies(t, e) {
                    for (let i = 0, s = e.length; !t.shouldStop(this) && i < s; i++) {
                        const s = e[i],
                            a = s.getAABB();
                        (a.overlapsRay(this) >= 0 || a.containsPoint(this.from)) && this.intersectBody(t, s)
                    }
                }
                intersectBody(t, e) {
                    if (this.checkCollisionResponse && !e.collisionResponse) return;
                    const i = g();
                    for (let s = 0; s < e.shapes.length; s++) {
                        const a = e.shapes[s];
                        if (this.checkCollisionResponse && !a.collisionResponse) continue;
                        if (0 === (this.collisionGroup & a.collisionMask) || 0 === (a.collisionGroup & this.collisionMask)) continue;
                        c(i, a.position, e.angle), b(i, i, e.position);
                        const o = a.angle + e.angle;
                        if (this.intersectShape(t, a, o, i, e), t.shouldStop(this)) break
                    }
                }
                intersectShape(t, e, i, s, a) {
                    const o = this.from,
                        n = s[0] - o[0],
                        r = s[1] - o[1],
                        l = n * this.direction[0] + r * this.direction[1],
                        h = o[0] + this.direction[0] * l,
                        c = o[1] + this.direction[1] * l,
                        d = (s[0] - h) * (s[0] - h) + (s[1] - c) * (s[1] - c);
                    d > e.boundingRadius * e.boundingRadius || (this._currentBody = a, this._currentShape = e, e.raycast(t, this, s, i), this._currentBody = this._currentShape = null)
                }
                getAABB(t) {
                    const e = this.to,
                        i = this.from;
                    v(t.lowerBound, Math.min(e[0], i[0]), Math.min(e[1], i[1])), v(t.upperBound, Math.max(e[0], i[0]), Math.max(e[1], i[1]))
                }
                reportIntersection(t, e, i, s = -1) {
                    const a = this._currentShape,
                        o = this._currentBody;
                    if (!(this.skipBackfaces && P(i, this.direction) > 0)) switch (this.mode) {
                        case I.ALL:
                            t.set(i, a, o, e, s), this.callback(t);
                            break;
                        case I.CLOSEST:
                            (e < t.fraction || !t.hasHit()) && t.set(i, a, o, e, s);
                            break;
                        case I.ANY:
                            t.set(i, a, o, e, s);
                            break
                    }
                }
            }
            s(I, "CLOSEST", 1), s(I, "ANY", 2), s(I, "ALL", 4);
            class O {
                constructor() {
                    this.normal = g(), this.shape = null, this.body = null, this.faceIndex = -1, this.fraction = -1, this.isStopped = !1
                }
                reset() {
                    v(this.normal, 0, 0), this.shape = null, this.body = null, this.faceIndex = -1, this.fraction = -1, this.isStopped = !1
                }
                getHitDistance(t) {
                    return B(t.from, t.to) * this.fraction
                }
                hasHit() {
                    return -1 !== this.fraction
                }
                getHitPoint(t, e) {
                    return E(t, e.from, e.to, this.fraction)
                }
                stop() {
                    this.isStopped = !0
                }
                shouldStop(t) {
                    return this.isStopped || -1 !== this.fraction && t.mode === I.ANY
                }
                set(t, e, i, s, a) {
                    y(this.normal, t), this.shape = e, this.body = i, this.fraction = s, this.faceIndex = a
                }
            }
            class F {
                constructor(t) {
                    this.id = F.idCounter++, this.body = null, this.position = g(), t.position && y(this.position, t.position), this.type = t.type, this.angle = t.angle ?? 0, this.collisionGroup = t.collisionGroup ?? 1, this.collisionResponse = t.collisionResponse ?? !0, this.collisionMask = t.collisionMask ?? 1, this.sensor = t.sensor ?? !1, this.material = t.material ?? null, this.boundingRadius = 0
                }
                updateBoundingRadius() {}
                computeAABB() {}
                raycast() {}
            }
            s(F, "idCounter", 0), s(F, "CIRCLE", 1), s(F, "CONVEX", 8), s(F, "BOX", 32);
            class R extends F {
                constructor(t = {}) {
                    super({
                        ...t,
                        type: F.CIRCLE
                    }), this.radius = t.radius ?? 1, this.boundingRadius = this.radius
                }
                computeMomentOfInertia() {
                    return this.radius * this.radius / 2
                }
                computeAABB(t, e) {
                    const i = this.radius;
                    v(t.upperBound, i, i), v(t.lowerBound, -i, -i), e && (b(t.lowerBound, t.lowerBound, e), b(t.upperBound, t.upperBound, e))
                }
                raycast(t, e, i) {
                    const s = e.from,
                        a = e.to,
                        o = this.radius,
                        n = (a[0] - s[0]) * (a[0] - s[0]) + (a[1] - s[1]) * (a[1] - s[1]),
                        r = 2 * ((a[0] - s[0]) * (s[0] - i[0]) + (a[1] - s[1]) * (s[1] - i[1])),
                        l = (s[0] - i[0]) * (s[0] - i[0]) + (s[1] - i[1]) * (s[1] - i[1]) - o * o,
                        h = r * r - 4 * n * l,
                        c = g(),
                        d = g();
                    if (!(h < 0))
                        if (0 === h) E(c, s, a, h), w(d, c, i), M(d, d), e.reportIntersection(t, h, d, -1);
                        else {
                            const o = Math.sqrt(h),
                                l = 1 / (2 * n),
                                p = (-r - o) * l,
                                u = (-r + o) * l;
                            if (p >= 0 && p <= 1 && (E(c, s, a, p), w(d, c, i), M(d, d), e.reportIntersection(t, p, d, -1), t.shouldStop(e))) return;
                            u >= 0 && u <= 1 && (E(c, s, a, u), w(d, c, i), M(d, d), e.reportIntersection(t, u, d, -1))
                        }
                }
            }
            class D extends F {
                constructor(t = {}) {
                    super({
                        type: F.CONVEX,
                        ...t
                    }), this.vertices = [];
                    for (let e = 0; e < (t.vertices || []).length; e++) this.vertices.push(f(t.vertices[e]));
                    this.normals = [];
                    for (let e = 0; e < this.vertices.length; e++) this.normals.push(g());
                    this.updateNormals(), this.updateBoundingRadius()
                }
                updateNormals() {
                    for (let t = 0; t < this.vertices.length; t++) {
                        const e = this.vertices[t],
                            i = this.vertices[(t + 1) % this.vertices.length],
                            s = this.normals[t];
                        w(s, i, e), d(s, s), M(s, s)
                    }
                }
                computeMomentOfInertia() {
                    let t = 0,
                        e = 0;
                    const i = this.vertices.length;
                    for (let s = i - 1, a = 0; a < i; s = a, a++) {
                        const i = this.vertices[s],
                            o = this.vertices[a],
                            n = Math.abs(r(i, o)),
                            l = P(o, o) + P(o, i) + P(i, i);
                        t += n * l, e += n
                    }
                    return 1 / 6 * (t / e)
                }
                updateBoundingRadius() {
                    let t = 0;
                    for (let e = 0; e < this.vertices.length; e++) {
                        const i = S(this.vertices[e]);
                        i > t && (t = i)
                    }
                    this.boundingRadius = Math.sqrt(t)
                }
                computeAABB(t, e, i) {
                    t.setFromPoints(this.vertices, e, i, 0)
                }
                raycast(t, e, i, s) {
                    const a = g(),
                        o = g(),
                        n = g();
                    p(a, e.from, i, s), p(o, e.to, i, s);
                    const r = this.vertices.length;
                    for (let l = 0; l < r && !t.shouldStop(e); l++) {
                        const i = this.vertices[l],
                            h = this.vertices[(l + 1) % r],
                            d = A(a, o, i, h);
                        d >= 0 && (w(n, h, i), c(n, n, -Math.PI / 2 + s), M(n, n), e.reportIntersection(t, d, n, l))
                    }
                }
            }
            class H extends D {
                constructor(t = {}) {
                    const e = t.width ?? 1,
                        i = t.height ?? 1,
                        s = [m(-e / 2, -i / 2), m(e / 2, -i / 2), m(e / 2, i / 2), m(-e / 2, i / 2)];
                    super({
                        ...t,
                        type: F.BOX,
                        vertices: s
                    }), this.width = e, this.height = i, this.updateBoundingRadius()
                }
                computeMomentOfInertia() {
                    const t = this.width,
                        e = this.height;
                    return (e * e + t * t) / 12
                }
                updateBoundingRadius() {
                    const t = this.width,
                        e = this.height;
                    this.boundingRadius = Math.sqrt(t * t + e * e) / 2
                }
                computeAABB(t, e, i) {
                    const s = Math.abs(Math.cos(i)),
                        a = Math.abs(Math.sin(i)),
                        o = this.width,
                        n = this.height,
                        r = .5 * (o * a + n * s),
                        l = .5 * (n * a + o * s),
                        h = t.lowerBound,
                        c = t.upperBound;
                    h[0] = e[0] - l, h[1] = e[1] - r, c[0] = e[0] + l, c[1] = e[1] + r
                }
            }
            class G {
                constructor() {
                    this.id = G.idCounter++
                }
            }
            s(G, "idCounter", 0);
            class z {
                constructor(t, e, i = {}) {
                    this.id = z.idCounter++, this.materialA = t, this.materialB = e, this.friction = i.friction ?? .3, this.restitution = i.restitution ?? 0, this.stiffness = i.stiffness ?? 1e6, this.relaxation = i.relaxation ?? 4, this.frictionStiffness = i.frictionStiffness ?? 1e6, this.frictionRelaxation = i.frictionRelaxation ?? 4, this.surfaceVelocity = i.surfaceVelocity ?? 0, this.contactSkinSize = .005
                }
            }
            s(z, "idCounter", 0);
            class N {
                constructor(t, e, i, s) {
                    this.bodyA = t, this.bodyB = e, this.minForce = i ?? -Number.MAX_VALUE, this.maxForce = s ?? Number.MAX_VALUE, this.maxBias = Number.MAX_VALUE, this.stiffness = N.DEFAULT_STIFFNESS, this.relaxation = N.DEFAULT_RELAXATION, this.G = new a(6);
                    for (let a = 0; a < 6; a++) this.G[a] = 0;
                    this.offset = 0, this.a = 0, this.b = 0, this.epsilon = 0, this.timeStep = 1 / 60, this.needsUpdate = !0, this.multiplier = 0, this.relativeVelocity = 0, this.enabled = !0, this.lambda = this.B = this.invC = this.minForceDt = this.maxForceDt = 0, this.index = -1
                }
                update() {
                    const t = this.stiffness,
                        e = this.relaxation,
                        i = this.timeStep;
                    this.a = 4 / (i * (1 + 4 * e)), this.b = 4 * e / (1 + 4 * e), this.epsilon = 4 / (i * i * t * (1 + 4 * e)), this.needsUpdate = !1
                }
                gmult(t, e, i, s, a) {
                    return t[0] * e[0] + t[1] * e[1] + t[2] * i + t[3] * s[0] + t[4] * s[1] + t[5] * a
                }
                computeGq() {
                    const t = this.G,
                        e = this.bodyA,
                        i = this.bodyB;
                    return this.gmult(t, U, e.angle, V, i.angle) + this.offset
                }
                computeGW() {
                    const t = this.G,
                        e = this.bodyA,
                        i = this.bodyB;
                    return this.gmult(t, e.velocity, e.angularVelocity, i.velocity, i.angularVelocity) + this.relativeVelocity
                }
                computeGWlambda() {
                    const t = this.G,
                        e = this.bodyA,
                        i = this.bodyB;
                    return this.gmult(t, e.vlambda, e.wlambda, i.vlambda, i.wlambda)
                }
                computeGiMf() {
                    const t = this.bodyA,
                        e = this.bodyB,
                        i = this.G,
                        s = g(),
                        a = g();
                    return C(s, t.force, t.invMassSolve), k(s, t.massMultiplier, s), C(a, e.force, e.invMassSolve), k(a, e.massMultiplier, a), this.gmult(i, s, t.angularForce * t.invInertiaSolve, a, e.angularForce * e.invInertiaSolve)
                }
                computeGiMGt() {
                    const t = this.bodyA,
                        e = this.bodyB,
                        i = this.G;
                    return i[0] * i[0] * t.invMassSolve * t.massMultiplier[0] + i[1] * i[1] * t.invMassSolve * t.massMultiplier[1] + i[2] * i[2] * t.invInertiaSolve + i[3] * i[3] * e.invMassSolve * e.massMultiplier[0] + i[4] * i[4] * e.invMassSolve * e.massMultiplier[1] + i[5] * i[5] * e.invInertiaSolve
                }
                addToWlambda(t) {
                    const e = this.bodyA,
                        i = this.bodyB,
                        s = this.G,
                        a = e.invMassSolve,
                        o = i.invMassSolve;
                    e.vlambda[0] += s[0] * a * t * e.massMultiplier[0], e.vlambda[1] += s[1] * a * t * e.massMultiplier[1], e.wlambda += e.invInertiaSolve * s[2] * t, i.vlambda[0] += s[3] * o * t * i.massMultiplier[0], i.vlambda[1] += s[4] * o * t * i.massMultiplier[1], i.wlambda += i.invInertiaSolve * s[5] * t
                }
                computeInvC(t) {
                    return 1 / (this.computeGiMGt() + t)
                }
            }
            s(N, "DEFAULT_STIFFNESS", 1e6), s(N, "DEFAULT_RELAXATION", 4);
            const U = g(),
                V = g(),
                q = new R({
                    radius: 1
                });
            class Y extends N {
                constructor(t, e) {
                    super(t, e, 0, Number.MAX_VALUE), this.contactPointA = g(), this.penetrationVec = g(), this.contactPointB = g(), this.normalA = g(), this.restitution = 0, this.firstImpact = !1, this.shapeA = q, this.shapeB = q
                }
                computeB(t, e, i) {
                    const s = this.bodyA,
                        a = this.bodyB,
                        o = this.contactPointA,
                        n = this.contactPointB,
                        l = s.position,
                        h = a.position,
                        c = this.normalA,
                        d = this.G,
                        p = r(o, c),
                        u = r(n, c);
                    let g, f;
                    if (d[0] = -c[0], d[1] = -c[1], d[2] = -p, d[3] = c[0], d[4] = c[1], d[5] = u, this.firstImpact && 0 !== this.restitution) f = 0, g = 1 / e * (1 + this.restitution) * this.computeGW();
                    else {
                        const t = this.penetrationVec;
                        t[0] = h[0] + n[0] - l[0] - o[0], t[1] = h[1] + n[1] - l[1] - o[1], f = P(c, t) + this.offset, g = this.computeGW()
                    }
                    return -f * t - g * e - i * this.computeGiMf()
                }
            }
            class K extends N {
                constructor(t, e, i = Number.MAX_VALUE) {
                    super(t, e, -i, i), this.contactPointA = g(), this.contactPointB = g(), this.t = g(), this.contactEquations = [], this.shapeA = null, this.shapeB = null, this.frictionCoefficient = .3
                }
                setSlipForce(t) {
                    this.maxForce = t, this.minForce = -t
                }
                getSlipForce() {
                    return this.maxForce
                }
                computeB(t, e, i) {
                    const s = this.contactPointA,
                        a = this.contactPointB,
                        o = this.t,
                        n = this.G;
                    return n[0] = -o[0], n[1] = -o[1], n[2] = -r(s, o), n[3] = o[0], n[4] = o[1], n[5] = r(a, o), -this.computeGW() * e - i * this.computeGiMf()
                }
            }
            const j = {
                position: g(),
                velocity: g(),
                vlambda: g(),
                force: g(),
                angle: 0,
                angularVelocity: 0,
                wlambda: 0,
                angularForce: 0,
                invMassSolve: 0,
                invInertiaSolve: 0,
                massMultiplier: m(1, 1),
                sleepState: 0,
                type: 1,
                collisionResponse: !0,
                shapes: []
            };
            class W {
                constructor() {
                    s(this, "objects", [])
                }
                get() {
                    return this.objects.length ? this.objects.pop() : new Y(j, j)
                }
                release(t) {
                    t.bodyA = t.bodyB = j, this.objects.push(t)
                }
            }
            class X {
                constructor() {
                    s(this, "objects", [])
                }
                get() {
                    return this.objects.length ? this.objects.pop() : new K(j, j)
                }
                release(t) {
                    t.bodyA = t.bodyB = j, this.objects.push(t)
                }
            }
            class J {
                constructor() {
                    s(this, "data", {}), s(this, "keys", [])
                }
                getKey(t, e) {
                    return t |= 0, e |= 0, t === e ? -1 : 0 | (t > e ? t << 16 | 65535 & e : e << 16 | 65535 & t)
                }
                get(t, e) {
                    return this.data[this.getKey(t, e)]
                }
                set(t, e, i) {
                    const s = this.getKey(t, e);
                    return this.data[s] || this.keys.push(s), this.data[s] = i, s
                }
                reset() {
                    this.keys = [], this.data = {}
                }
            }
            class Z {
                constructor(t = {}) {
                    this.equations = [], this.iterations = t.iterations ?? 10, this.tolerance = t.tolerance ?? 1e-7, this.frictionIterations = t.frictionIterations ?? 0, this.usedIterations = 0
                }
                addEquations(t) {
                    for (let e = 0; e < t.length; e++) t[e].enabled && this.equations.push(t[e])
                }
                removeAllEquations() {
                    this.equations.length = 0
                }
                solve(t, e) {
                    const i = this.iterations,
                        s = this.frictionIterations,
                        a = this.equations,
                        o = a.length,
                        n = this.tolerance * o * (this.tolerance * o),
                        r = e.bodies,
                        l = r.length;
                    if (this.usedIterations = 0, o)
                        for (let h = 0; h < l; h++) r[h].updateSolveMassProperties();
                    for (let h = 0; h < o; h++) {
                        const e = a[h];
                        e.lambda = 0, (e.timeStep !== t || e.needsUpdate) && (e.timeStep = t, e.update()), e.B = e.computeB(e.a, e.b, t), e.invC = e.computeInvC(e.epsilon), e.maxForceDt = e.maxForce * t, e.minForceDt = e.minForce * t
                    }
                    if (0 !== o) {
                        for (let t = 0; t < l; t++) r[t].resetConstraintVelocity();
                        if (s) {
                            for (let t = 0; t < s; t++) {
                                let t = 0;
                                for (let e = 0; e < o; e++) t += Math.abs(tt(a[e]));
                                if (this.usedIterations++, t * t <= n) break
                            }
                            Q(a, 1 / t);
                            for (let e = 0; e < o; e++) {
                                const i = a[e];
                                if (i instanceof K) {
                                    let e = 0;
                                    for (let t = 0; t < i.contactEquations.length; t++) e += i.contactEquations[t].multiplier;
                                    e *= i.frictionCoefficient / i.contactEquations.length, i.maxForce = e, i.minForce = -e, i.maxForceDt = e * t, i.minForceDt = -e * t
                                }
                            }
                        }
                        for (let t = 0; t < i; t++) {
                            let t = 0;
                            for (let e = 0; e < o; e++) t += Math.abs(tt(a[e]));
                            if (this.usedIterations++, t * t < n) break
                        }
                        for (let t = 0; t < l; t++) r[t].addConstraintVelocity();
                        Q(a, 1 / t)
                    }
                }
            }

            function Q(t, e) {
                for (let i = t.length - 1; i >= 0; i--) t[i].multiplier = t[i].lambda * e
            }

            function tt(t) {
                const e = t.computeGWlambda();
                let i = t.invC * (t.B - e - t.epsilon * t.lambda);
                const s = t.lambda + i;
                return s < t.minForceDt ? i = t.minForceDt - t.lambda : s > t.maxForceDt && (i = t.maxForceDt - t.lambda), t.lambda += i, t.addToWlambda(i), i
            }
            class et {
                constructor() {
                    this.result = [], this.world = void 0
                }
                setWorld(t) {
                    this.world = t
                }
                getCollisionPairs(t) {
                    const e = t.bodies,
                        i = this.result;
                    i.length = 0;
                    for (let s = 0; s < e.length; s++) {
                        const t = e[s];
                        for (let a = 0; a < s; a++) {
                            const s = e[a];
                            it(t, s) && st(t, s) && i.push(t, s)
                        }
                    }
                    return i
                }
                aabbQuery(t, e, i = []) {
                    for (let s = 0; s < t.bodies.length; s++) {
                        const a = t.bodies[s];
                        a.aabbNeedsUpdate && a.updateAABB(), a.aabb.overlaps(e) && i.push(a)
                    }
                    return i
                }
            }

            function it(t, e) {
                const i = 2,
                    s = 2,
                    a = t.type,
                    o = e.type;
                return (a !== i || o !== i) && ((t.sleepState !== s || e.sleepState !== s) && !(t.sleepState === s && o === i || e.sleepState === s && a === i))
            }

            function st(t, e) {
                return t.getAABB().overlaps(e.getAABB())
            }
            class at {
                constructor() {
                    s(this, "narrowphases", {
                        [F.CIRCLE]: this.circleCircle.bind(this),
                        [F.CIRCLE | F.CONVEX]: this.circleConvex.bind(this),
                        [F.CIRCLE | F.BOX]: this.circleConvex.bind(this),
                        [F.CONVEX]: this.convexConvex.bind(this),
                        [F.CONVEX | F.BOX]: this.convexConvex.bind(this),
                        [F.BOX]: this.convexConvex.bind(this)
                    }), this.contactEquations = [], this.frictionEquations = [], this.enableFriction = !0, this.enabledEquations = !0, this.slipForce = 10, this.contactEquationPool = new W, this.frictionEquationPool = new X, this.enableFrictionReduction = !0, this.collidingBodiesLastStep = new J, this.currentContactMaterial = null
                }
                reset() {
                    this.collidingBodiesLastStep.reset();
                    const t = this.contactEquations;
                    for (let e = t.length - 1; e >= 0; e--) this.collidingBodiesLastStep.set(t[e].bodyA.id, t[e].bodyB.id, !0);
                    for (let e = 0; e < this.contactEquations.length; e++) this.contactEquationPool.release(this.contactEquations[e]);
                    for (let e = 0; e < this.frictionEquations.length; e++) this.frictionEquationPool.release(this.frictionEquations[e]);
                    this.contactEquations.length = this.frictionEquations.length = 0
                }
                collidedLastStep(t, e) {
                    return !!this.collidingBodiesLastStep.get(0 | t.id, 0 | e.id)
                }
                createContactEquation(t, e, i, s) {
                    const a = this.contactEquationPool.get(),
                        o = this.currentContactMaterial;
                    return a.bodyA = t, a.bodyB = e, a.shapeA = i, a.shapeB = s, a.enabled = this.enabledEquations, a.firstImpact = !this.collidedLastStep(t, e), a.restitution = o.restitution, a.stiffness = o.stiffness, a.relaxation = o.relaxation, a.offset = o.contactSkinSize, a.needsUpdate = !0, a
                }
                createFrictionEquation(t, e, i, s) {
                    const a = this.frictionEquationPool.get(),
                        o = this.currentContactMaterial;
                    return a.bodyA = t, a.bodyB = e, a.shapeA = i, a.shapeB = s, a.setSlipForce(this.slipForce), a.enabled = this.enabledEquations, a.frictionCoefficient = o.friction, a.relativeVelocity = o.surfaceVelocity, a.stiffness = o.frictionStiffness, a.relaxation = o.frictionRelaxation, a.needsUpdate = !0, a.contactEquations.length = 0, a
                }
                createFrictionFromContact(t) {
                    const e = this.createFrictionEquation(t.bodyA, t.bodyB, t.shapeA, t.shapeB);
                    return y(e.contactPointA, t.contactPointA), y(e.contactPointB, t.contactPointB), d(e.t, t.normalA), e.contactEquations.push(t), e
                }
                createFrictionFromAverage(t) {
                    let e = this.contactEquations[this.contactEquations.length - 1];
                    const i = this.createFrictionEquation(e.bodyA, e.bodyB, e.shapeA, e.shapeB),
                        s = e.bodyA;
                    v(i.contactPointA, 0, 0), v(i.contactPointB, 0, 0), v(i.t, 0, 0);
                    for (let o = 0; o < t; o++) e = this.contactEquations[this.contactEquations.length - 1 - o], e.bodyA === s ? (b(i.t, i.t, e.normalA), b(i.contactPointA, i.contactPointA, e.contactPointA), b(i.contactPointB, i.contactPointB, e.contactPointB)) : (w(i.t, i.t, e.normalA), b(i.contactPointA, i.contactPointA, e.contactPointB), b(i.contactPointB, i.contactPointB, e.contactPointA)), i.contactEquations.push(e);
                    const a = 1 / t;
                    return C(i.contactPointA, i.contactPointA, a), C(i.contactPointB, i.contactPointB, a), M(i.t, i.t), d(i.t, i.t), i
                }
                circleCircle(t, e, i, s, a, o, n, r, l = !1, h, c) {
                    h = h ?? e.radius, c = c ?? o.radius;
                    const d = g();
                    w(d, i, n);
                    const p = h + c;
                    if (S(d) > p * p) return 0;
                    if (l) return 1;
                    const u = this.createContactEquation(t, a, e, o);
                    return w(u.normalA, n, i), M(u.normalA, u.normalA), C(u.contactPointA, u.normalA, h), C(u.contactPointB, u.normalA, -c), u.contactPointA[0] += i[0] - t.position[0], u.contactPointA[1] += i[1] - t.position[1], u.contactPointB[0] += n[0] - a.position[0], u.contactPointB[1] += n[1] - a.position[1], this.contactEquations.push(u), this.enableFriction && this.frictionEquations.push(this.createFrictionFromContact(u)), 1
                }
                circleConvex(t, e, i, s, a, o, n, r, l = !1, h) {
                    h = h ?? e.radius;
                    const c = g();
                    p(c, i, n, r);
                    const f = o.vertices,
                        m = o.normals,
                        v = f.length,
                        k = o.boundingRadius + h,
                        B = g();
                    let _ = -Number.MAX_VALUE,
                        x = -1;
                    for (let d = 0; d < v; d++) {
                        w(B, c, f[d]);
                        const t = P(m[d], B);
                        if (t > k) return 0;
                        t > _ && (_ = t, x = d)
                    }
                    const E = g(),
                        A = g();
                    let L = -1,
                        T = Number.MAX_VALUE;
                    for (let d = x + v - 1; d < x + v + 2; d++) {
                        const t = f[d % v],
                            e = m[d % v];
                        if (C(E, e, -h), b(E, E, c), ot(E, o)) {
                            w(A, t, E);
                            const i = Math.abs(P(A, e));
                            i < T && (T = i, L = d)
                        }
                    }
                    if (-1 !== L) {
                        if (l) return 1;
                        const s = f[L % v],
                            c = f[(L + 1) % v],
                            p = g(),
                            m = g(),
                            y = g(),
                            k = g(),
                            B = g();
                        u(p, s, n, r), u(m, c, n, r), w(y, m, p), M(k, y), d(B, k), C(E, B, -h), b(E, E, i);
                        const _ = g();
                        C(_, B, T), b(_, _, E);
                        const x = this.createContactEquation(t, a, e, o);
                        return w(x.normalA, E, i), M(x.normalA, x.normalA), C(x.contactPointA, x.normalA, h), b(x.contactPointA, x.contactPointA, i), w(x.contactPointA, x.contactPointA, t.position), w(x.contactPointB, _, n), b(x.contactPointB, x.contactPointB, n), w(x.contactPointB, x.contactPointB, a.position), this.contactEquations.push(x), this.enableFriction && this.frictionEquations.push(this.createFrictionFromContact(x)), 1
                    }
                    if (h > 0 && -1 !== x) {
                        const s = g(),
                            d = g();
                        for (let p = x + v; p < x + v + 2; p++) {
                            const g = f[p % v];
                            if (w(s, g, c), S(s) < h * h) {
                                if (l) return 1;
                                u(d, g, n, r), w(s, d, i);
                                const c = this.createContactEquation(t, a, e, o);
                                return y(c.normalA, s), M(c.normalA, c.normalA), C(c.contactPointA, c.normalA, h), b(c.contactPointA, c.contactPointA, i), w(c.contactPointA, c.contactPointA, t.position), w(c.contactPointB, d, n), b(c.contactPointB, c.contactPointB, n), w(c.contactPointB, c.contactPointB, a.position), this.contactEquations.push(c), this.enableFriction && this.frictionEquations.push(this.createFrictionFromContact(c)), 1
                            }
                        }
                    }
                    return 0
                }
                convexConvex(t, e, i, s, a, o, n, r, h = !1) {
                    const d = g(),
                        p = g(),
                        m = ct(d, e, i, s, o, n, r),
                        v = d[0];
                    if (v > 0) return 0;
                    const k = ct(p, o, n, r, e, i, s),
                        B = p[0];
                    if (B > 0) return 0;
                    let _, x, S, E, A, L, T, $, I;
                    B > v ? (_ = o, x = e, T = a, $ = t, S = n, A = r, E = i, L = s, I = k) : (_ = e, x = o, T = t, $ = a, S = i, A = s, E = n, L = r, I = m);
                    const O = [g(), g()];
                    pt(O, _, S, A, I, x, E, L);
                    const F = _.vertices.length,
                        R = _.vertices,
                        D = I,
                        H = I + 1 < F ? I + 1 : 0,
                        G = f(R[D]),
                        z = f(R[H]),
                        N = g();
                    w(N, z, G), M(N, N);
                    const U = g();
                    l(U, N, 1);
                    const V = g();
                    b(V, G, z), C(V, V, .5);
                    const q = g(),
                        Y = g();
                    c(q, N, A), l(Y, q, 1), u(G, R[D], S, A), u(z, R[H], S, A);
                    const K = P(Y, G),
                        j = -P(q, G),
                        W = P(q, z),
                        X = [g(), g()],
                        J = [g(), g()],
                        Z = g();
                    C(Z, q, -1);
                    let Q = ut(X, O, Z, j);
                    if (Q < 2) return 0;
                    if (Q = ut(J, X, q, W), Q < 2) return 0;
                    let tt = 0;
                    const et = g();
                    for (let l = 0; l < 2; l++) {
                        const t = P(Y, J[l]) - K;
                        if (t <= 0) {
                            if (h) return 1;
                            tt++;
                            const e = this.createContactEquation(T, $, _, x);
                            y(e.normalA, Y), y(e.contactPointB, J[l]), w(e.contactPointB, e.contactPointB, $.position), C(et, Y, -t), b(e.contactPointA, J[l], et), w(e.contactPointA, e.contactPointA, T.position), this.contactEquations.push(e), this.enableFriction && !this.enableFrictionReduction && this.frictionEquations.push(this.createFrictionFromContact(e))
                        }
                    }
                    return tt && this.enableFrictionReduction && this.enableFriction && this.frictionEquations.push(this.createFrictionFromAverage(tt)), tt
                }
            }

            function ot(t, e) {
                const i = g(),
                    s = g(),
                    a = e.vertices,
                    o = a.length;
                let n = null;
                for (let l = 0; l < o + 1; l++) {
                    w(i, a[l % o], t), w(s, a[(l + 1) % o], t);
                    const e = r(i, s);
                    if (null === n && (n = e), e * n < 0) return !1;
                    n = e
                }
                return !0
            }
            const nt = g(),
                rt = g(),
                lt = g(),
                ht = g();

            function ct(t, e, i, s, a, o, n) {
                const r = e.vertices.length,
                    l = a.vertices.length,
                    h = e.normals,
                    d = e.vertices,
                    g = a.vertices,
                    f = s - n;
                let m = 0,
                    y = -Number.MAX_VALUE;
                for (let v = 0; v < r; v++) {
                    c(nt, h[v], f), u(ht, d[v], i, s), p(rt, ht, o, n);
                    let t = Number.MAX_VALUE;
                    for (let e = 0; e < l; e++) {
                        w(lt, g[e], rt);
                        const i = P(nt, lt);
                        i < t && (t = i)
                    }
                    t > y && (y = t, m = v)
                }
                return t[0] = y, m
            }
            const dt = g();

            function pt(t, e, i, s, a, o, n, r) {
                const l = e.normals,
                    h = o.vertices.length,
                    d = o.vertices,
                    p = o.normals;
                c(dt, l[a], s - r);
                let g = 0,
                    f = Number.MAX_VALUE;
                for (let c = 0; c < h; c++) {
                    const t = P(dt, p[c]);
                    t < f && (f = t, g = c)
                }
                const m = g,
                    y = m + 1 < h ? m + 1 : 0;
                u(t[0], d[m], n, r), u(t[1], d[y], n, r)
            }

            function ut(t, e, i, s) {
                let a = 0;
                const o = P(i, e[0]) - s,
                    n = P(i, e[1]) - s;
                if (o <= 0 && y(t[a++], e[0]), n <= 0 && y(t[a++], e[1]), o * n < 0) {
                    const i = o / (o - n),
                        s = t[a];
                    w(s, e[1], e[0]), C(s, s, i), b(s, s, e[0]), a++
                }
                return a
            }
            class gt extends $ {
                constructor(t = {}) {
                    super(), this.id = t.id || ++gt._idCounter, this.index = -1, this.world = null, this.shapes = [], this.mass = t.mass || 0, this.invMass = 0, this.inertia = 0, this.invInertia = 0, this.invMassSolve = 0, this.invInertiaSolve = 0, this.fixedRotation = !!t.fixedRotation, this.fixedX = !!t.fixedX, this.fixedY = !!t.fixedY, this.massMultiplier = g(), this.position = t.position ? f(t.position) : g(), this.previousPosition = f(this.position), this.velocity = t.velocity ? f(t.velocity) : g(), this.vlambda = g(), this.wlambda = 0, this.angle = t.angle || 0, this.previousAngle = this.angle, this.angularVelocity = t.angularVelocity || 0, this.force = t.force ? f(t.force) : g(), this.angularForce = t.angularForce || 0, this.damping = t.damping ?? .1, this.angularDamping = t.angularDamping ?? .1, this.type = gt.STATIC, void 0 !== t.type ? this.type = t.type : t.mass && (this.type = gt.DYNAMIC), this.boundingRadius = 0, this.aabb = new T, this.aabbNeedsUpdate = !0, this.allowSleep = t.allowSleep ?? !0, this.wantsToSleep = !1, this.sleepState = gt.AWAKE, this.sleepSpeedLimit = t.sleepSpeedLimit ?? .2, this.sleepTimeLimit = t.sleepTimeLimit ?? 1, this.idleTime = 0, this.collisionResponse = t.collisionResponse ?? !0, this._wakeUpAfterNarrowphase = !1, this.updateMassProperties()
                }
                updateSolveMassProperties() {
                    this.sleepState === gt.SLEEPING || this.type === gt.KINEMATIC ? (this.invMassSolve = 0, this.invInertiaSolve = 0) : (this.invMassSolve = this.invMass, this.invInertiaSolve = this.invInertia)
                }
                getAABB() {
                    return this.aabbNeedsUpdate && this.updateAABB(), this.aabb
                }
                updateAABB() {
                    const t = this.shapes,
                        e = g(),
                        i = new T;
                    for (let s = 0; s < t.length; s++) {
                        const a = t[s],
                            o = a.angle + this.angle;
                        u(e, a.position, this.position, this.angle), a.computeAABB(i, e, o), 0 === s ? this.aabb.copy(i) : this.aabb.extend(i)
                    }
                    this.aabbNeedsUpdate = !1
                }
                updateBoundingRadius() {
                    let t = 0;
                    for (let e = 0; e < this.shapes.length; e++) {
                        const i = this.shapes[e],
                            s = x(i.position);
                        s + i.boundingRadius > t && (t = s + i.boundingRadius)
                    }
                    this.boundingRadius = t
                }
                addShape(t, e, i) {
                    if (t.body) throw new Error("A shape can only be added to one body.");
                    t.body = this, e ? y(t.position, e) : v(t.position, 0, 0), t.angle = i || 0, this.shapes.push(t), this.updateMassProperties(), this.updateBoundingRadius(), this.aabbNeedsUpdate = !0
                }
                updateMassProperties() {
                    if (this.type === gt.STATIC || this.type === gt.KINEMATIC) this.mass = Number.MAX_VALUE, this.invMass = 0, this.inertia = Number.MAX_VALUE, this.invInertia = 0;
                    else {
                        const t = this.shapes;
                        let e = 0;
                        if (this.fixedRotation) this.inertia = Number.MAX_VALUE, this.invInertia = 0;
                        else {
                            for (let i = 0; i < t.length; i++) {
                                const s = t[i];
                                e += s.computeMomentOfInertia() + S(s.position)
                            }
                            this.inertia = this.mass * e, this.invInertia = e > 0 ? 1 / e : 0
                        }
                        this.invMass = 1 / this.mass, v(this.massMultiplier, this.fixedX ? 0 : 1, this.fixedY ? 0 : 1)
                    }
                }
                applyForce(t, e) {
                    b(this.force, this.force, t), e && (this.angularForce += r(e, t))
                }
                applyImpulse(t, e) {
                    if (this.type !== gt.DYNAMIC) return;
                    const i = g();
                    C(i, t, this.invMass), k(i, this.massMultiplier, i), b(this.velocity, i, this.velocity), e && (this.angularVelocity += r(e, t) * this.invInertia)
                }
                toWorldFrame(t, e) {
                    u(t, e, this.position, this.angle)
                }
                getVelocityAtPoint(t, e) {
                    return l(t, e, this.angularVelocity), w(t, this.velocity, t), t
                }
                applyDamping(t) {
                    if (this.type === gt.DYNAMIC) {
                        const e = this.velocity,
                            i = Math.pow(1 - this.damping, t);
                        e[0] *= i, e[1] *= i, this.angularVelocity *= Math.pow(1 - this.angularDamping, t)
                    }
                }
                wakeUp() {
                    const t = this.sleepState;
                    this.sleepState = gt.AWAKE, this.idleTime = 0, t !== gt.AWAKE && this.emit({
                        type: "wakeup"
                    })
                }
                sleep() {
                    this.sleepState = gt.SLEEPING, this.angularVelocity = this.angularForce = 0, v(this.velocity, 0, 0), v(this.force, 0, 0), this.emit({
                        type: "sleep"
                    })
                }
                sleepTick(t, e, i) {
                    if (!this.allowSleep || this.type === gt.SLEEPING) return;
                    this.wantsToSleep = !1;
                    const s = S(this.velocity) + this.angularVelocity * this.angularVelocity,
                        a = this.sleepSpeedLimit * this.sleepSpeedLimit;
                    s >= a ? (this.idleTime = 0, this.sleepState = gt.AWAKE) : (this.idleTime += i, this.sleepState !== gt.SLEEPY && (this.sleepState = gt.SLEEPY, this.emit({
                        type: "sleepy"
                    }))), this.idleTime > this.sleepTimeLimit && (e ? this.wantsToSleep = !0 : this.sleep())
                }
                integrate(t) {
                    const e = this.position,
                        i = this.velocity,
                        s = this.force;
                    y(this.previousPosition, e), this.previousAngle = this.angle, this.fixedRotation || (this.angularVelocity += this.angularForce * this.invInertia * t);
                    const a = g();
                    C(a, s, t * this.invMass), k(a, this.massMultiplier, a), b(i, a, i);
                    const o = g();
                    C(o, i, t), b(e, e, o), this.fixedRotation || (this.angle += this.angularVelocity * t), this.aabbNeedsUpdate = !0
                }
                setZeroForce() {
                    this.force[0] = this.force[1] = this.angularForce = 0
                }
                resetConstraintVelocity() {
                    v(this.vlambda, 0, 0), this.wlambda = 0
                }
                addConstraintVelocity() {
                    b(this.velocity, this.velocity, this.vlambda), this.angularVelocity += this.wlambda
                }
            }
            s(gt, "DYNAMIC", 1), s(gt, "STATIC", 2), s(gt, "KINEMATIC", 4), s(gt, "AWAKE", 0), s(gt, "SLEEPY", 1), s(gt, "SLEEPING", 2), s(gt, "_idCounter", 0);
            class ft extends $ {
                constructor(t = {}) {
                    super(), this.bodies = [], this.hasActiveBodies = !1, this.solver = t.solver || new Z, this.narrowphase = new at, this.gravity = m(0, -9.78), t.gravity && y(this.gravity, t.gravity), this.frictionGravity = x(this.gravity) || 10, this.useWorldGravityAsFrictionGravity = !0, this.useFrictionGravityOnZeroGravity = !0, this.broadphase = t.broadphase || new et, this.broadphase.setWorld(this), this.defaultMaterial = new G, this.defaultContactMaterial = new z(this.defaultMaterial, this.defaultMaterial), this.lastTimeStep = 1 / 60, this.applyDamping = !0, this.applyGravity = !0, this.applySpringForces = !1, this.solveConstraints = !0, this.contactMaterials = [], this.time = 0, this.accumulator = 0, this.stepping = !1, this.emitImpactEvent = !0, this.sleepMode = ft.NO_SLEEPING
                }
                addContactMaterial(t) {
                    this.contactMaterials.push(t)
                }
                removeContactMaterial(t) {
                    n(this.contactMaterials, t)
                }
                getContactMaterial(t, e) {
                    const i = this.contactMaterials;
                    for (let s = 0; s < i.length; s++) {
                        const a = i[s];
                        if (a.materialA === t && a.materialB === e || a.materialA === e && a.materialB === t) return a
                    }
                    return !1
                }
                addBody(t) {
                    if (this.stepping) throw new Error("Bodies cannot be added during step.");
                    if (t.world) throw new Error("Body is already added to a World.");
                    t.index = this.bodies.length, this.bodies.push(t), t.world = this
                }
                removeBody(t) {
                    if (this.stepping) throw new Error("Bodies cannot be removed during step.");
                    t.world = null, n(this.bodies, t), t.index = -1;
                    for (let e = this.bodies.length - 1; e >= 0; e--) this.bodies[e].index = e;
                    t.resetConstraintVelocity()
                }
                step(t) {
                    this.internalStep(t), this.time += t
                }
                internalStep(t) {
                    this.stepping = !0;
                    const e = this.bodies,
                        i = this.gravity,
                        s = this.solver,
                        a = e.length,
                        n = this.narrowphase,
                        r = g();
                    if (this.lastTimeStep = t, this.useWorldGravityAsFrictionGravity) {
                        const t = x(this.gravity);
                        0 === t && this.useFrictionGravityOnZeroGravity || (this.frictionGravity = t)
                    }
                    if (this.applyGravity)
                        for (let o = 0; o < a; o++) {
                            const t = e[o];
                            t.type === gt.DYNAMIC && t.sleepState !== gt.SLEEPING && (C(r, i, t.mass), b(t.force, t.force, r))
                        }
                    if (this.applyDamping)
                        for (let o = 0; o < a; o++) e[o].type === gt.DYNAMIC && e[o].applyDamping(t);
                    const l = this.broadphase.getCollisionPairs(this);
                    n.reset();
                    const h = this.defaultContactMaterial,
                        c = this.frictionGravity;
                    for (let o = 0; o < l.length; o += 2) {
                        const t = l[o],
                            e = l[o + 1];
                        for (let i = 0; i < t.shapes.length; i++) {
                            const s = t.shapes[i];
                            for (let i = 0; i < e.shapes.length; i++) {
                                const a = e.shapes[i];
                                let o = !1;
                                s.material && a.material && (o = this.getContactMaterial(s.material, a.material)), mt(this, n, t, s, s.position, s.angle, e, a, a.position, a.angle, o || h, c)
                            }
                        }
                    }
                    for (let o = 0; o < a; o++) {
                        const t = e[o];
                        t._wakeUpAfterNarrowphase && (t.wakeUp(), t._wakeUpAfterNarrowphase = !1)
                    }
                    if (n.contactEquations.length || n.frictionEquations.length) {
                        const e = [];
                        o(e, n.contactEquations), o(e, n.frictionEquations), s.addEquations(e), this.solveConstraints && s.solve(t, this), s.removeAllEquations()
                    }
                    for (let o = 0; o < a; o++) {
                        const i = e[o];
                        i.type === gt.DYNAMIC && i.integrate(t)
                    }
                    for (let o = 0; o < a; o++) e[o].setZeroForce();
                    if (this.emitImpactEvent && this.has("impact"))
                        for (let o = 0; o < n.contactEquations.length; o++) {
                            const t = n.contactEquations[o];
                            t.firstImpact && this.emit({
                                type: "impact",
                                bodyA: t.bodyA,
                                bodyB: t.bodyB,
                                shapeA: t.shapeA,
                                shapeB: t.shapeB,
                                contactEquation: t
                            })
                        }
                    if (this.sleepMode === ft.BODY_SLEEPING) {
                        let i = !1;
                        for (let s = 0; s < a; s++) {
                            const a = e[s];
                            a.sleepTick(this.time, !1, t), a.sleepState !== gt.SLEEPING && a.type !== gt.STATIC && (i = !0)
                        }
                        this.hasActiveBodies = i
                    }
                    this.stepping = !1
                }
                setGlobalStiffness(t) {
                    for (let e = 0; e < this.contactMaterials.length; e++) {
                        const i = this.contactMaterials[e];
                        i.stiffness = i.frictionStiffness = t
                    }
                    this.defaultContactMaterial.stiffness = this.defaultContactMaterial.frictionStiffness = t
                }
                raycast(t, e) {
                    const i = new T,
                        s = [];
                    return e.getAABB(i), this.broadphase.aabbQuery(this, i, s), e.intersectBodies(t, s), s.length = 0, t.hasHit()
                }
                clear() {
                    this.solver.removeAllEquations();
                    let t = this.bodies.length;
                    while (t--) this.removeBody(this.bodies[t]);
                    t = this.contactMaterials.length;
                    while (t--) this.removeContactMaterial(this.contactMaterials[t])
                }
            }

            function mt(t, e, i, s, a, o, n, r, l, h, c, d) {
                if (0 === (s.collisionGroup & r.collisionMask) || 0 === (r.collisionGroup & s.collisionMask)) return;
                const p = g(),
                    f = g();
                if (u(p, a, i.position, i.angle), u(f, l, n.position, n.angle), B(p, f) > s.boundingRadius + r.boundingRadius) return;
                const m = o + i.angle,
                    y = h + n.angle;
                let v;
                e.enableFriction = c.friction > 0, v = i.type === gt.STATIC || i.type === gt.KINEMATIC ? n.mass : n.type === gt.STATIC || n.type === gt.KINEMATIC ? i.mass : i.mass * n.mass / (i.mass + n.mass), e.slipForce = c.friction * d * v, e.currentContactMaterial = c, e.enabledEquations = i.collisionResponse && n.collisionResponse && s.collisionResponse && r.collisionResponse;
                const b = s.type | r.type,
                    w = e.narrowphases[b];
                if (!w) return;
                const k = s.sensor || r.sensor,
                    C = e.frictionEquations.length;
                let _;
                _ = s.type <= r.type ? w(i, s, p, m, n, r, f, y, k) : w(n, r, f, y, i, s, p, m, k);
                const x = e.frictionEquations.length - C;
                if (_ && (!k && i.allowSleep && i.type === gt.DYNAMIC && i.sleepState === gt.SLEEPING && n.sleepState === gt.AWAKE && n.type === gt.DYNAMIC && (i._wakeUpAfterNarrowphase = !0), !k && n.allowSleep && n.type === gt.DYNAMIC && n.sleepState === gt.SLEEPING && i.sleepState === gt.AWAKE && i.type === gt.DYNAMIC && (n._wakeUpAfterNarrowphase = !0), !k && x > 1))
                    for (let u = e.frictionEquations.length - x; u < e.frictionEquations.length; u++) {
                        const t = e.frictionEquations[u];
                        t.setSlipForce(t.getSlipForce() / x)
                    }
            }
            s(ft, "NO_SLEEPING", 1), s(ft, "BODY_SLEEPING", 2), t.exports = {
                AABB: T,
                Body: gt,
                Box: H,
                Circle: R,
                ContactMaterial: z,
                EventEmitter: $,
                GSSolver: Z,
                Material: G,
                NaiveBroadphase: et,
                Ray: I,
                RaycastResult: O,
                Shape: F,
                World: ft,
                vec2: L
            }
        },
        39501: (t, e, i) => {
            i(46831), i(46831);
            const s = (t, e) => Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2)),
                a = (t, e) => [].concat.apply([], t.map((t => [].concat.apply([], e.map((e => [t(e)])))))),
                o = t => t[0],
                n = (t, e) => e.map(t),
                r = t => t[1],
                l = (t, e) => {
                    const i = t => e => t(o(e)) - t(r(e)),
                        [s, l, h, c] = a([i(o), i(r)], [t, e]),
                        d = s * c - h * l;
                    if (0 === d) return;
                    const [p, u] = n((([t, e]) => o(t) * r(e) - o(e) * r(t)), [t, e]);
                    return a([([t, e]) => (p * t - e * u) / d], [
                        [l, s],
                        [c, h]
                    ])
                },
                h = (t, e, i) => {
                    const a = {
                            x: t.x,
                            y: t.y
                        },
                        o = s(a, e);
                    if (o > i) {
                        const t = (a.x - e.x) / o,
                            s = (a.y - e.y) / o;
                        a.x = e.x + t * i, a.y = e.y + s * i
                    }
                    return a
                },
                c = (t, e, i) => {
                    const s = h(t, e, i);
                    return s.x !== t.x || s.y !== t.y
                };
            t.exports = {
                getDistance: s,
                getIntersectingPointOnLines: l,
                movePositionInCircle: h,
                isOutsideOfCircle: c
            }
        },
        97418: (t, e, i) => {
            i(86323), i(86323);
            const s = (t, e) => {
                    t.includes(e) || t.push(e)
                },
                a = (t, e) => {
                    const i = t.indexOf(e); - 1 !== i && t.splice(i, 1)
                },
                o = (t, e) => {
                    for (const i of t) i(e)
                };
            t.exports = {
                addListener: s,
                removeListener: a,
                fireEvent: o
            }
        },
        48353: (t, e, i) => {
            i(86323), i(86323);
            const {
                addListener: s,
                removeListener: a,
                fireEvent: o
            } = i(97418), n = {
                active: !1,
                activeKeys: [],
                listeners: {
                    activeKeys: []
                }
            }, r = t => {
                if ("INPUT" === t.target.tagName || "TEXTAREA" === t.target.tagName) return;
                const e = t?.key?.toLowerCase();
                n.activeKeys.includes(e) || void 0 === e || "capslock" === e || (n.activeKeys.push(e), h())
            }, l = t => {
                const e = t?.key?.toLowerCase(),
                    i = n.activeKeys.indexOf(e);
                void 0 !== e && -1 !== i && (n.activeKeys.splice(i, 1), h())
            }, h = () => {
                o(n.listeners.activeKeys, n.activeKeys)
            }, c = t => {
                s(n.listeners.activeKeys, t)
            }, d = t => {
                a(n.listeners.activeKeys, t)
            }, p = t => {
                if (t.length !== n.activeKeys.length) return !1;
                for (const e of t)
                    if (!n.activeKeys.includes(e)) return !1;
                return !0
            }, u = t => {
                if (t.length < 2 || t.length === n.activeKeys.length) return !1;
                for (const e of t)
                    if (n.activeKeys.includes(e)) return !0;
                return !1
            }, g = () => {
                n.active || (n.active = !0, document.addEventListener("keydown", r), document.addEventListener("keyup", l))
            }, f = () => {
                n.active && (n.active = !1, n.activeKeys.length > 0 && (n.activeKeys = [], h()), document.removeEventListener("keydown", r), document.removeEventListener("keyup", l))
            };
            window.addEventListener("focus", g), window.addEventListener("blur", f), g(), t.exports = {
                addActiveKeysListener: c,
                removeActiveKeysListener: d,
                isSelectedActiveKeys: p,
                isPartialActiveKeys: u
            }
        },
        86399: (t, e, i) => {
            var s = i(48486);

            function a(t, e, i) {
                return (e = s(e)) in t ? Object.defineProperty(t, e, {
                    value: i,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : t[e] = i, t
            }
            t.exports = a, t.exports.__esModule = !0, t.exports["default"] = t.exports
        },
        35019: (t, e, i) => {
            var s = i(53032)["default"];

            function a(t, e) {
                if ("object" != s(t) || !t) return t;
                var i = t[Symbol.toPrimitive];
                if (void 0 !== i) {
                    var a = i.call(t, e || "default");
                    if ("object" != s(a)) return a;
                    throw new TypeError("@@toPrimitive must return a primitive value.")
                }
                return ("string" === e ? String : Number)(t)
            }
            t.exports = a, t.exports.__esModule = !0, t.exports["default"] = t.exports
        },
        48486: (t, e, i) => {
            var s = i(53032)["default"],
                a = i(35019);

            function o(t) {
                var e = a(t, "string");
                return "symbol" == s(e) ? e : e + ""
            }
            t.exports = o, t.exports.__esModule = !0, t.exports["default"] = t.exports
        },
        53032: t => {
            function e(i) {
                return t.exports = e = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
                    return typeof t
                } : function(t) {
                    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
                }, t.exports.__esModule = !0, t.exports["default"] = t.exports, e(i)
            }
            t.exports = e, t.exports.__esModule = !0, t.exports["default"] = t.exports
        }
    }
]);