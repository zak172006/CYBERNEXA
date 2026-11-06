
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const scanButton = document.getElementById("scanButton");
  const scanMessage = document.getElementById("scanMessage");

  // فتح وإغلاق القائمة الجانبية على الهاتف
  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // إغلاق القائمة بعد اختيار قسم
  document.querySelectorAll(".side-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".side-link").forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");

      if (sidebar) {
        sidebar.classList.remove("open");
      }
    });
  });

  // تحديث القسم النشط أثناء التصفح
  const sections = document.querySelectorAll(
    "main section[id], main div[id]"
  );

  if ("IntersectionObserver" in window && sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const activeLink = document.querySelector(
            `.side-link[href="#${entry.target.id}"]`
          );

          if (activeLink) {
            document.querySelectorAll(".side-link").forEach((link) => {
              link.classList.remove("active");
            });

            activeLink.classList.add("active");
          }
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // محاكاة واجهة الفحص فقط — لا يتم فحص جهاز حقيقي
  if (scanButton) {
    scanButton.addEventListener("click", () => {
      if (scanMessage) {
        scanMessage.textContent =
          "Demo mode: الفحص الحقيقي غير متصل حاليًا. سيتم تفعيل محرك الفحص عند إعداد النظام الخلفي.";
        scanMessage.classList.add("visible");
      }

      scanButton.disabled = true;
      scanButton.textContent = "Demo Mode";

      setTimeout(() => {
        scanButton.disabled = false;
        scanButton.textContent = "Start Scan";
      }, 2500);
    });
  }

  // تحديث السنة إن وُجد عنصر مخصص لها
  const yearElement = document.getElementById("currentYear");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
