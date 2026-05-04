/** @odoo-module **/

import { loadBundle } from "@web/core/assets";
import { Component, onWillStart, useEffect, useRef } from "@odoo/owl";

export class DashboardChart extends Component {
    static template = "nakivo_reseller_portal.DashboardChart";
    static props = {
        title: String,
        subtitle: { type: String, optional: true },
        chartType: String, // 'bar' | 'doughnut'
        labels: Array,
        datasets: Array,
        loading: { type: Boolean, optional: true },
        size: { type: String, optional: true }, // 'sm' | 'md' | 'xl'
    };

    setup() {
        this.canvasRef = useRef("canvas");
        this.chart = null;

        onWillStart(async () => {
            await loadBundle("web.chartjs_lib");
        });

        useEffect(() => {
            this._renderChart();
            return () => {
                if (this.chart) {
                    this.chart.destroy();
                    this.chart = null;
                }
            };
        });
    }

    get sizeClass() {
        const s = this.props.size || "md";
        if (s === "sm") return "np-chart-area--sm";
        if (s === "xl") return "np-chart-area--xl";
        return "";
    }

    _renderChart() {
        if (!this.canvasRef.el) return;
        if (!this.props.labels.length) return;
        if (this.chart) {
            this.chart.destroy();
        }
        // Chart is loaded globally by web.chartjs_lib bundle

        this.chart = new Chart(this.canvasRef.el, this._buildConfig());
    }

    _buildConfig() {
        const { chartType, labels, datasets } = this.props;

        if (chartType === "doughnut") {
            return {
                type: "doughnut",
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "right",
                            labels: { boxWidth: 12, font: { size: 12 } },
                        },
                    },
                },
            };
        }

        // bar (default)
        return {
            type: "bar",
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) =>
                                "$" +
                                value.toLocaleString("en", {
                                    maximumFractionDigits: 0,
                                }),
                        },
                    },
                },
            },
        };
    }
}
