import React, { useEffect, useRef } from 'react';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(PieController, ArcElement, Tooltip, Legend);

const PieChartComponent = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Initialize chart when component mounts
    const initChart = () => {
      const ctx = chartRef.current.getContext('2d');
      
      // Ensure we have valid data
      const chartData = data && data.length > 0 ? data : [
        { name: 'Paid', value: 7 },
        { name: 'Pending', value: 3 }
      ];
      
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      // Create new chart
      chartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: chartData.map(item => item.name),
          datasets: [{
            data: chartData.map(item => item.value),
            backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  size: 14
                }
              }
            }
          }
        }
      });
    };

    // If canvas is available, initialize chart
    if (chartRef.current) {
      initChart();
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '250px' }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default PieChartComponent; 