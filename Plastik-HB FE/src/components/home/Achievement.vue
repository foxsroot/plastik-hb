<template>
    <section class="achievement-section">
        <div class="container">
            <h2 class="section-title">Achievement</h2>

            <div class="achievement-content">
                <!-- Left side - Large image/content area -->
                <div class="achievement-main">
                    <div class="main-content">
                        <!-- You can add main achievement content here -->
                        <div class="main-placeholder">
                            <h3>Pencapaian Utama</h3>
                            <p>Konten utama pencapaian perusahaan</p>
                        </div>
                    </div>
                </div>

                <!-- Right side - Achievement grid (auto-fill) -->
                <div class="achievement-grid">
                    <div v-for="(achievement, index) in achievements" :key="index" class="achievement-item">
                        <div class="achievement-icon">
                            <img :src="achievement.image" :alt="achievement.title" />
                        </div>
                        <div class="achievement-info">
                            <div class="achievement-percentage">{{ achievement.percentage }}</div>
                            <div class="achievement-description">{{ achievement.description }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'Achievement',
    data() {
        return {
            achievements: [
                {
                    image: 'https://placehold.co/80x80/4CAF50/ffffff?text=1',
                    percentage: '95%',
                    description: 'Kepuasan Pelanggan'
                },
                {
                    image: 'https://placehold.co/80x80/2196F3/ffffff?text=2',
                    percentage: '87%',
                    description: 'Kualitas Produk'
                },
                {
                    image: 'https://placehold.co/80x80/FF9800/ffffff?text=3',
                    percentage: '92%',
                    description: 'Ketepatan Waktu'
                },
                {
                    image: 'https://placehold.co/80x80/9C27B0/ffffff?text=4',
                    percentage: '78%',
                    description: 'Inovasi Produk'
                },
                {
                    image: 'https://placehold.co/80x80/F44336/ffffff?text=5',
                    percentage: '89%',
                    description: 'Efisiensi Produksi'
                }
            ]
        }
    }
}
</script>

<style scoped>
.achievement-section {
    padding: 4rem 0;
    background-color: #f8f9fa;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.section-title {
    text-align: center;
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 3rem;
    color: #333;
}

.achievement-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: start;
}

.achievement-main {
    background: white;
    border: 2px solid #ddd;
    border-radius: 12px;
    padding: 2rem;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.main-content {
    text-align: center;
    width: 100%;
}

.main-placeholder h3 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 1rem;
}

.main-placeholder p {
    color: #666;
    font-size: 1.1rem;
    line-height: 1.6;
}

.achievement-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-flow: row;
    gap: 1.5rem;
    align-content: start;
}

.achievement-item {
    background: white;
    border: 2px solid #ddd;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.achievement-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: #007bff;
}

.achievement-icon {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #eee;
}

.achievement-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.achievement-info {
    flex: 1;
}

.achievement-percentage {
    font-size: 1.5rem;
    font-weight: bold;
    color: #007bff;
    margin-bottom: 0.25rem;
}

.achievement-description {
    font-size: 0.95rem;
    color: #666;
    line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
    .achievement-content {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .achievement-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .achievement-main {
        height: 200px;
        padding: 1.5rem;
    }

    .main-placeholder h3 {
        font-size: 1.5rem;
    }

    .main-placeholder p {
        font-size: 1rem;
    }

    .section-title {
        font-size: 2rem;
        margin-bottom: 2rem;
    }

    .achievement-item {
        padding: 1rem;
    }

    .achievement-icon {
        width: 50px;
        height: 50px;
    }

    .achievement-percentage {
        font-size: 1.3rem;
    }

    .achievement-description {
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    .achievement-section {
        padding: 2rem 0;
    }

    .container {
        padding: 0 15px;
    }

    .achievement-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .achievement-item {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
    }

    .achievement-icon {
        align-self: center;
    }
}
</style>