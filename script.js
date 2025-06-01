// Sistem Rekomendasi Makanan dengan Machine Learning
// Menggunakan Collaborative Filtering dan Adaptive Learning

class SistemRekomendasiMakanan {
    constructor() {
        this.dataMakanan = this.inisialisasiDataMakanan();
        this.dataRating = new Map(); // Menyimpan rating pengguna
        this.modelPembelajaran = {
            bobotFitur: new Map(),
            riwayatPembelajaran: [],
            tingkatAkurasi: 0,
            statusAktif: false
        };
        this.preferensiPengguna = {
            nama: '',
            lokasi: '',
            budget: '',
            kategoriDisukai: new Map()
        };
        
        this.inisialisasiEventListener();
        this.inisialisasiTampilanRating();
    }

    // Data makanan dengan berbagai fitur untuk pembelajaran
    inisialisasiDataMakanan() {
        return [
            {
                id: 1,
                nama: "Nasi Gudeg Yogya",
                kategori: "tradisional",
                lokasi: ["Yogyakarta", "Jakarta"],
                harga: "sedang",
                rating: 4.5,
                fiturRasa: { manis: 0.8, pedas: 0.3, gurih: 0.6 },
                deskripsi: "Gudeg khas Yogyakarta dengan cita rasa manis yang autentik"
            },
            {
                id: 2,
                nama: "Sate Ayam Madura",
                kategori: "tradisional",
                lokasi: ["Jakarta", "Surabaya", "Bandung"],
                harga: "murah",
                rating: 4.3,
                fiturRasa: { manis: 0.6, pedas: 0.4, gurih: 0.9 },
                deskripsi: "Sate ayam dengan bumbu kacang khas Madura yang gurih"
            },
            {
                id: 3,
                nama: "Pizza Margherita",
                kategori: "western",
                lokasi: ["Jakarta", "Bandung", "Surabaya"],
                harga: "mahal",
                rating: 4.2,
                fiturRasa: { manis: 0.2, pedas: 0.1, gurih: 0.8 },
                deskripsi: "Pizza Italia klasik dengan mozzarella dan basil segar"
            },
            {
                id: 4,
                nama: "Rendang Daging",
                kategori: "tradisional",
                lokasi: ["Jakarta", "Bandung", "Medan"],
                harga: "mahal",
                rating: 4.8,
                fiturRasa: { manis: 0.3, pedas: 0.9, gurih: 0.8 },
                deskripsi: "Rendang Padang dengan bumbu rempah yang kaya dan pedas"
            },
            {
                id: 5,
                nama: "Burger Beef Deluxe",
                kategori: "fastfood",
                lokasi: ["Jakarta", "Surabaya", "Bandung"],
                harga: "sedang",
                rating: 4.0,
                fiturRasa: { manis: 0.4, pedas: 0.2, gurih: 0.9 },
                deskripsi: "Burger daging sapi premium dengan sayuran segar"
            },
            {
                id: 6,
                nama: "Gado-gado Jakarta",
                kategori: "sehat",
                lokasi: ["Jakarta", "Bandung"],
                harga: "murah",
                rating: 4.1,
                fiturRasa: { manis: 0.5, pedas: 0.3, gurih: 0.7 },
                deskripsi: "Salad Indonesia dengan bumbu kacang yang menyegarkan"
            },
            {
                id: 7,
                nama: "Sushi Salmon Teriyaki",
                kategori: "japanese",
                lokasi: ["Jakarta", "Surabaya"],
                harga: "mahal",
                rating: 4.4,
                fiturRasa: { manis: 0.6, pedas: 0.1, gurih: 0.7 },
                deskripsi: "Sushi salmon dengan saus teriyaki yang manis"
            },
            {
                id: 8,
                nama: "Ayam Geprek Sambal Matah",
                kategori: "tradisional",
                lokasi: ["Jakarta", "Bandung", "Yogyakarta"],
                harga: "murah",
                rating: 4.3,
                fiturRasa: { manis: 0.2, pedas: 0.8, gurih: 0.6 },
                deskripsi: "Ayam crispy dengan sambal matah khas Bali yang pedas"
            },
            {
                id: 9,
                nama: "Salad Caesar",
                kategori: "sehat",
                lokasi: ["Jakarta", "Bandung", "Surabaya"],
                harga: "sedang",
                rating: 3.9,
                fiturRasa: { manis: 0.1, pedas: 0.1, gurih: 0.8 },
                deskripsi: "Salad segar dengan dressing caesar dan crouton"
            },
            {
                id: 10,
                nama: "Mi Ayam Bakso",
                kategori: "tradisional",
                lokasi: ["Jakarta", "Bandung", "Surabaya", "Yogyakarta"],
                harga: "murah",
                rating: 4.2,
                fiturRasa: { manis: 0.3, pedas: 0.2, gurih: 0.9 },
                deskripsi: "Mi ayam dengan bakso sapi dan kuah kaldu yang gurih"
            }
        ];
    }

    // Inisialisasi event listeners
    inisialisasiEventListener() {
        document.getElementById('btn-simpan-rating').addEventListener('click', () => {
            this.simpanRatingPengguna();
        });

        document.getElementById('btn-dapatkan-rekomendasi').addEventListener('click', () => {
            this.hasilkanRekomendasi();
        });

        document.getElementById('btn-reset-pembelajaran').addEventListener('click', () => {
            this.resetPembelajaran();
        });

        // Event listener untuk profil pengguna
        document.getElementById('nama-pengguna').addEventListener('change', (e) => {
            this.preferensiPengguna.nama = e.target.value;
        });

        document.getElementById('lokasi-pengguna').addEventListener('change', (e) => {
            this.preferensiPengguna.lokasi = e.target.value;
        });

        document.getElementById('budget-pengguna').addEventListener('change', (e) => {
            this.preferensiPengguna.budget = e.target.value;
        });
    }

    // Inisialisasi tampilan rating makanan
    inisialisasiTampilanRating() {
        const container = document.getElementById('makanan-rating');
        container.innerHTML = '';

        // Pilih 6 makanan acak untuk rating
        const makananUntukRating = this.shuffleArray([...this.dataMakanan]).slice(0, 6);
        
        makananUntukRating.forEach(makanan => {
            const cardElement = this.buatKartuRating(makanan);
            container.appendChild(cardElement);
        });
    }

    // Membuat kartu rating untuk setiap makanan
    buatKartuRating(makanan) {
        const card = document.createElement('div');
        card.className = 'makanan-card';
        card.innerHTML = `
            <h3>${makanan.nama}</h3>
            <div class="makanan-info">
                <p><strong>Kategori:</strong> ${this.kapitalisasi(makanan.kategori)}</p>
                <p><strong>Harga:</strong> ${this.kapitalisasi(makanan.harga)}</p>
                <p>${makanan.deskripsi}</p>
            </div>
            <div class="rating-container">
                <label>Rating Anda:</label>
                <div class="rating-stars" data-makanan-id="${makanan.id}">
                    ${this.buatBintangRating(makanan.id)}
                </div>
            </div>
        `;

        // Event listener untuk rating bintang
        const bintangContainer = card.querySelector('.rating-stars');
        this.tambahkanEventBintang(bintangContainer, makanan.id);

        return card;
    }

    // Membuat elemen bintang rating
    buatBintangRating(makananId) {
        let bintangHTML = '';
        for (let i = 1; i <= 5; i++) {
            bintangHTML += `<span class="star" data-rating="${i}">★</span>`;
        }
        return bintangHTML;
    }

    // Menambahkan event listener untuk bintang rating
    tambahkanEventBintang(container, makananId) {
        const bintang = container.querySelectorAll('.star');
        
        bintang.forEach((star, index) => {
            star.addEventListener('click', () => {
                const rating = index + 1;
                this.setRatingBintang(container, rating);
                this.dataRating.set(makananId, rating);
                this.updateStatistikPembelajaran();
            });

            star.addEventListener('mouseover', () => {
                this.highlightBintang(container, index + 1);
            });
        });

        container.addEventListener('mouseleave', () => {
            const ratingTersimpan = this.dataRating.get(makananId) || 0;
            this.setRatingBintang(container, ratingTersimpan);
        });
    }

    // Set rating bintang visual
    setRatingBintang(container, rating) {
        const bintang = container.querySelectorAll('.star');
        bintang.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Highlight bintang saat hover
    highlightBintang(container, rating) {
        const bintang = container.querySelectorAll('.star');
        bintang.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#f39c12';
            } else {
                star.style.color = '#ddd';
            }
        });
    }

    // Simpan rating pengguna dan lakukan pembelajaran
    simpanRatingPengguna() {
        if (this.dataRating.size === 0) {
            alert('Silakan beri rating pada beberapa makanan terlebih dahulu!');
            return;
        }

        this.pelajariPreferensiPengguna();
        this.updateModelPembelajaran();
        this.tampilkanNotifikasiSukses();
    }

    // Algoritma pembelajaran preferensi pengguna
    pelajariPreferensiPengguna() {
        this.modelPembelajaran.statusAktif = true;
        const kategoriSkor = new Map();
        const rasaSkor = { manis: 0, pedas: 0, gurih: 0 };
        let totalRating = 0;

        // Analisis rating pengguna untuk pembelajaran
        this.dataRating.forEach((rating, makananId) => {
            const makanan = this.dataMakanan.find(m => m.id === makananId);
            if (makanan && rating >= 4) { // Hanya makanan yang disukai (rating >= 4)
                // Pembelajaran kategori
                const kategori = makanan.kategori;
                kategoriSkor.set(kategori, (kategoriSkor.get(kategori) || 0) + rating);

                // Pembelajaran profil rasa
                Object.keys(makanan.fiturRasa).forEach(rasa => {
                    rasaSkor[rasa] += makanan.fiturRasa[rasa] * rating;
                });

                totalRating += rating;
            }
        });

        // Normalisasi dan simpan ke model pembelajaran
        if (totalRating > 0) {
            // Bobot kategori berdasarkan preferensi
            kategoriSkor.forEach((skor, kategori) => {
                this.modelPembelajaran.bobotFitur.set(`kategori_${kategori}`, skor / totalRating);
            });

            // Bobot rasa berdasarkan preferensi
            Object.keys(rasaSkor).forEach(rasa => {
                this.modelPembelajaran.bobotFitur.set(`rasa_${rasa}`, rasaSkor[rasa] / totalRating);
            });

            // Hitung tingkat kepercayaan model
            this.hitungTingkatKepercayaan();
        }

        // Simpan riwayat pembelajaran
        this.modelPembelajaran.riwayatPembelajaran.push({
            timestamp: new Date(),
            jumlahRating: this.dataRating.size,
            bobotTerlatih: Object.fromEntries(this.modelPembelajaran.bobotFitur)
        });

        console.log('Model pembelajaran diperbarui:', this.modelPembelajaran);
    }

    // Hitung tingkat kepercayaan model berdasarkan konsistensi data
    hitungTingkatKepercayaan() {
        const jumlahData = this.dataRating.size;
        const konsistensiBobot = this.hitungKonsistensiBobot();
        
        // Formula sederhana untuk confidence: berdasarkan jumlah data dan konsistensi
        let confidence = Math.min((jumlahData / 10) * 0.7 + konsistensiBobot * 0.3, 1.0);
        this.modelPembelajaran.tingkatAkurasi = Math.round(confidence * 100);
    }

    // Hitung konsistensi bobot (seberapa stabil preferensi pengguna)
    hitungKonsistensiBobot() {
        if (this.modelPembelajaran.riwayatPembelajaran.length < 2) return 0.5;
        
        // Bandingkan bobot saat ini dengan sebelumnya
        const riwayatTerakhir = this.modelPembelajaran.riwayatPembelajaran.slice(-2);
        let totalSelisih = 0;
        let jumlahBobot = 0;

        this.modelPembelajaran.bobotFitur.forEach((bobot, kunci) => {
            const bobotSebelum = riwayatTerakhir[0]?.bobotTerlatih?.[kunci] || 0;
            totalSelisih += Math.abs(bobot - bobotSebelum);
            jumlahBobot++;
        });

        const konsistensi = jumlahBobot > 0 ? 1 - (totalSelisih / jumlahBobot) : 0.5;
        return Math.max(konsistensi, 0);
    }

    // Update model pembelajaran dengan adaptive algorithm
    updateModelPembelajaran() {
        // Implementasi adaptive learning - model menyesuaikan diri dengan data baru
        const faktorAdaptasi = 0.8; // Learning rate
        
        // Update bobot dengan decay untuk mengurangi overfitting
        this.modelPembelajaran.bobotFitur.forEach((bobot, kunci) => {
            const bobotBaru = bobot * faktorAdaptasi + (1 - faktorAdaptasi) * 0.5;
            this.modelPembelajaran.bobotFitur.set(kunci, bobotBaru);
        });

        this.updateStatistikPembelajaran();
    }

    // Generate rekomendasi menggunakan Collaborative Filtering + Content-based
    hasilkanRekomendasi() {
        if (this.dataRating.size === 0) {
            alert('Silakan beri rating pada beberapa makanan terlebih dahulu!');
            return;
        }

        const btn = document.getElementById('btn-dapatkan-rekomendasi');
        const originalText = btn.textContent;
        btn.innerHTML = '<span class="loading"></span> Menganalisis Preferensi...';
        btn.disabled = true;

        // Simulasi proses AI (dengan delay untuk UX yang lebih baik)
        setTimeout(() => {
            const rekomendasi = this.hitungRekomendasiCerdas();
            this.tampilkanRekomendasi(rekomendasi);
            
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
    }

    // Algoritma rekomendasi cerdas dengan multiple factors
    hitungRekomendasiCerdas() {
        const skorRekomendasi = new Map();
        
        // Filter makanan yang belum di-rating
        const makananBelumRating = this.dataMakanan.filter(makanan => 
            !this.dataRating.has(makanan.id)
        );

        makananBelumRating.forEach(makanan => {
            let skor = 0;
            let bobotTotal = 0;

            // 1. Content-based filtering berdasarkan kategori
            const bobotKategori = this.modelPembelajaran.bobotFitur.get(`kategori_${makanan.kategori}`) || 0;
            skor += bobotKategori * 0.4;
            bobotTotal += 0.4;

            // 2. Content-based filtering berdasarkan profil rasa
            Object.keys(makanan.fiturRasa).forEach(rasa => {
                const bobotRasa = this.modelPembelajaran.bobotFitur.get(`rasa_${rasa}`) || 0;
                skor += bobotRasa * makanan.fiturRasa[rasa] * 0.3;
                bobotTotal += 0.3;
            });

            // 3. Collaborative filtering sederhana (popularity-based)
            const skorPopularitas = makanan.rating / 5.0;
            skor += skorPopularitas * 0.2;
            bobotTotal += 0.2;

            // 4. Filter berdasarkan preferensi lokasi dan budget
            let bonusLokasi = 0;
            let bonusBudget = 0;

            if (this.preferensiPengguna.lokasi && makanan.lokasi.includes(this.preferensiPengguna.lokasi)) {
                bonusLokasi = 0.15;
            }

            if (this.preferensiPengguna.budget && makanan.harga === this.preferensiPengguna.budget) {
                bonusBudget = 0.1;
            }

            skor += bonusLokasi + bonusBudget;

            // 5. Randomness factor untuk diversity
            const faktorKeberagaman = Math.random() * 0.1;
            skor += faktorKeberagaman;

            // Normalisasi skor
            const skorFinal = skor / (bobotTotal + bonusLokasi + bonusBudget + 0.1);
            skorRekomendasi.set(makanan.id, {
                makanan: makanan,
                skor: skorFinal,
                confidence: this.modelPembelajaran.tingkatAkurasi
            });
        });

        // Sort berdasarkan skor dan ambil top 4
        const rekomendasiTerurut = Array.from(skorRekomendasi.values())
            .sort((a, b) => b.skor - a.skor)
            .slice(0, 4);

        return rekomendasiTerurut;
    }

    // Tampilkan hasil rekomendasi
    tampilkanRekomendasi(rekomendasi) {
        const container = document.getElementById('hasil-rekomendasi');
        container.innerHTML = '';

        if (rekomendasi.length === 0) {
            container.innerHTML = `
                <div class="info-card">
                    <p>Tidak ada rekomendasi baru. Coba beri rating pada lebih banyak makanan!</p>
                </div>
            `;
            return;
        }

        rekomendasi.forEach((item, index) => {
            const { makanan, skor, confidence } = item;
            const card = document.createElement('div');
            card.className = 'rekomendasi-card';
            
            // Hitung confidence score dalam persentase
            const confidenceScore = Math.round((skor * confidence) / 100 * 100);
            
            card.innerHTML = `
                <div class="confidence-score">
                    Match: ${confidenceScore}% | AI Confidence: ${confidence}%
                </div>
                <h3>${makanan.nama}</h3>
                <div class="detail-info">
                    <p><strong>Kategori:</strong> ${this.kapitalisasi(makanan.kategori)}</p>
                    <p><strong>Lokasi:</strong> ${makanan.lokasi.join(', ')}</p>
                    <p><strong>Harga:</strong> ${this.kapitalisasi(makanan.harga)}</p>
                    <p><strong>Rating Komunitas:</strong> ⭐ ${makanan.rating}/5.0</p>
                    <p><strong>Profil Rasa:</strong> 
                        Manis ${Math.round(makanan.fiturRasa.manis * 100)}%, 
                        Pedas ${Math.round(makanan.fiturRasa.pedas * 100)}%, 
                        Gurih ${Math.round(makanan.fiturRasa.gurih * 100)}%
                    </p>
                    <p style="margin-top: 1rem; font-style: italic;">${makanan.deskripsi}</p>
                </div>
            `;

            // Animasi muncul bertahap
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            container.appendChild(card);

            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });

        // Update statistik pembelajaran
        this.updateStatistikPembelajaran();
    }

    // Update statistik pembelajaran di UI
    updateStatistikPembelajaran() {
        document.getElementById('total-rating').textContent = this.dataRating.size;
        document.getElementById('akurasi-model').textContent = `${this.modelPembelajaran.tingkatAkurasi}%`;
        
        // Deteksi preferensi utama
        let preferensiUtama = 'Belum Terdeteksi';
        let skorTertinggi = 0;
        
        this.modelPembelajaran.bobotFitur.forEach((bobot, kunci) => {
            if (kunci.startsWith('kategori_') && bobot > skorTertinggi) {
                skorTertinggi = bobot;
                preferensiUtama = this.kapitalisasi(kunci.replace('kategori_', ''));
            }
        });
        
        document.getElementById('preferensi-utama').textContent = preferensiUtama;
        
        // Status pembelajaran
        const statusElement = document.getElementById('status-pembelajaran');
        if (this.modelPembelajaran.statusAktif && this.dataRating.size > 0) {
            statusElement.textContent = 'Aktif';
            statusElement.className = 'status-aktif';
        } else {
            statusElement.textContent = 'Tidak Aktif';
            statusElement.className = 'status-tidak-aktif';
        }

        // Bobot model
        const bobotText = this.modelPembelajaran.bobotFitur.size > 0 ? 
            `${this.modelPembelajaran.bobotFitur.size} Fitur Terlatih` : 'Belum Dilatih';
        document.getElementById('bobot-model').textContent = bobotText;

        // Confidence level
        document.getElementById('confidence-level').textContent = `${this.modelPembelajaran.tingkatAkurasi}%`;
    }

    // Reset pembelajaran (untuk demo adaptability)
    resetPembelajaran() {
        if (confirm('Yakin ingin reset pembelajaran AI? Semua data preferensi akan hilang.')) {
            this.dataRating.clear();
            this.modelPembelajaran = {
                bobotFitur: new Map(),
                riwayatPembelajaran: [],
                tingkatAkurasi: 0,
                statusAktif: false
            };
            
            // Reset tampilan
            this.inisialisasiTampilanRating();
            document.getElementById('hasil-rekomendasi').innerHTML = `
                <div class="info-card">
                    <p>Pembelajaran telah direset. Silakan beri rating pada makanan untuk memulai kembali.</p>
                </div>
            `;
            
            this.updateStatistikPembelajaran();
            alert('Pembelajaran AI telah direset!');
        }
    }

    // Notifikasi sukses setelah menyimpan rating
    tampilkanNotifikasiSukses() {
        const notification = document.createElement('div');
        notification.className = 'notification-success';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
            z-index: 1000;
            animation: slideIn 0.5s ease;
        `;
        notification.innerHTML = `
            <strong>✅ Pembelajaran Berhasil!</strong><br>
            AI telah mempelajari ${this.dataRating.size} preferensi Anda
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);

        // Tambahkan CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // Utility functions
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    kapitalisasi(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Inisialisasi sistem saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 Sistem Rekomendasi Makanan dengan AI dimulai...');
    
    // Buat instance sistem rekomendasi
    window.sistemRekomendasi = new SistemRekomendasiMakanan();
    
    // Tambahkan efek loading yang smooth
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    console.log('✅ Sistem Rekomendasi Makanan siap digunakan!');
    console.log('📊 Fitur Machine Learning: Collaborative Filtering + Content-based Filtering');
    console.log('🔄 Adaptive Learning: Model akan belajar dari setiap rating pengguna');
    console.log('🎯 Personalisasi: Rekomendasi disesuaikan dengan preferensi individual');
});