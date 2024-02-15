<template>
  <div>
    <div class="container">
      <img src="../assets/2_rueckgeb.jpeg" alt="test">
      <img src="../assets/3_rueckost.jpeg" alt="test">
      <img src="../assets/4.jpeg" alt="test">
      <img src="../assets/5_westwand.jpeg" alt="test">
      <img src="../assets/6_ostwand.jpeg" alt="test">
      <video width="216" height="384" autoplay muted>
        <source src="../assets/PXL_20240213_092647771.TS_1.mp4" type="video/mp4">
      </video>
    </div>
  </div>

</template>

<script>
export default {
  name: "RossmannSynagoge",
  mounted() {
    this.makeDraggable();
  },
  methods: {
    makeDraggable() {
      const draggables = document.querySelectorAll('.container img, .container video');
      draggables.forEach(draggable => {
        draggable.addEventListener('mousedown', this.dragMouseDown);

        // Optional: Touch screen support
        draggable.addEventListener('touchstart', this.dragTouchStart, { passive: true });
        draggable.addEventListener('touchmove', this.dragTouchMove, { passive: false });
        draggable.addEventListener('touchend', this.stopDragElement, { passive: true });
      });
    },
    dragMouseDown(e) {
      e.preventDefault();
      document.onmouseup = this.stopDragElement;
      document.onmousemove = this.elementDrag.bind(this, e.target);
    },
    dragTouchStart(e) {
      this.initialX = e.touches[0].clientX;
      this.initialY = e.touches[0].clientY;
      e.target.onmousemove = this.dragTouchMove.bind(this, e.target);
    },
    dragTouchMove(e) {
      e.preventDefault();
      let target = e.targetTouches[0].target;
      let dx = e.targetTouches[0].clientX - this.initialX;
      let dy = e.targetTouches[0].clientY - this.initialY;
      target.style.left = `${target.offsetLeft + dx}px`;
      target.style.top = `${target.offsetTop + dy}px`;
      this.initialX = e.targetTouches[0].clientX;
      this.initialY = e.targetTouches[0].clientY;
    },
    elementDrag(target, e) {
      e.preventDefault();
      target.style.left = `${e.clientX - target.offsetWidth / 2}px`;
      target.style.top = `${e.clientY - target.offsetHeight / 2}px`;
    },
    stopDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
}
</script>

<style lang="scss" scoped>
  .container {
    position: relative;
    display: inline-block;

    img,
    div {
      width: 400px;
      position: absolute;
      -webkit-box-shadow: 6px 6px 4px -1px rgba(0,0,0,0.29);
      box-shadow: 6px 6px 4px -1px rgba(0,0,0,0.29);
    }
    video {
      position: absolute;
      top: 4rem;
      left: 1rem;
      -webkit-box-shadow: 6px 6px 4px -1px rgba(0,0,0,0.29);
    }
    img:nth-child(2) {
      left: 5rem;
      top: 3rem;
    }
    img:nth-child(3) {
      left: 2rem;
      top: 1rem;
    }
    img:nth-child(4) {
      left: 7rem;
      top: 1rem;
    }
  }
 
</style>
