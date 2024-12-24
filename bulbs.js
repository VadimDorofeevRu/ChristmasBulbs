const NS = 'http://www.w3.org/2000/svg';

function randomInt(max) {
	return Math.floor(Math.random() * max);
}

class Bulb {
	constructor(options) {
		this.options = options;
		this.colorIndex = 0;

		let container_width = Math.max(options.bulb_size, options.holder_size);
		let container_height = options.holder / 2 + options.bulb_size;

		this.svg = document.createElementNS(NS, 'svg');
		this.svg.style.position = 'fixed';
		this.svg.style.top = '0px';
		this.svg.style.width = `${container_width}px`;
		this.svg.style.height = `${container_height}px`;
		this.svg.style['z-index'] = 9000;
		document.body.appendChild(this.svg);

		this.bulb = document.createElementNS(NS, 'circle');
		this.bulb.setAttributeNS(null, 'cx', `${options.bulb_size / 2}px`);
		this.bulb.setAttributeNS(null, 'cy', `${options.bulb_size / 2 + options.holder_size / 2 - 1}px`);
		this.bulb.setAttributeNS(null, 'r', `${options.bulb_size / 2}px`);
		this.bulb.setAttributeNS(null, 'fill', options.colors[randomInt(options.colors.length)]);
		this.svg.appendChild(this.bulb);

		this.holder = document.createElementNS(NS, 'rect');
		this.holder.setAttributeNS(null, 'x', `${Math.floor(options.bulb_size / 2 - options.holder_size / 2)}px`);
		this.holder.setAttributeNS(null, 'y', `0px`);
		this.holder.setAttributeNS(null, 'width', `${options.holder_size}px`);
		this.holder.setAttributeNS(null, 'height', `${options.holder_size / 2}px`);
		this.holder.setAttributeNS(null, 'fill', `gray`);
		this.svg.appendChild(this.holder);
	}

	get left() {
		return this.svg.style.left;
	}

	set left(value) {
		this.svg.style.left = `${value}px`;
	}

	get color() {
		return this.bulb.getAttributeNS(null, 'fill');
	}

	set color(value) {
		this.bulb.setAttributeNS(null, 'fill', value);
	}

	addCord(x1, x2) {
		let m1 = (x2 - x1) / 3;
		let m2 = (x2 - x1) * 2 / 3;
		let y = (x2 - x1) / 7;
		let d = `M 0,0 C ${m1},${y} ${m2},${y} ${x2 - x1},0`;

		this.cord = document.createElementNS(NS, 'svg');
		this.cord.style.position = 'fixed';
		this.cord.style.top = '0px';
		this.cord.style.left = `${x1}px`;
		this.cord.style.width = `${x2 - x1}px`;
		this.cord.style.height = `${y}px`;
		this.cord.style['z-index'] = 8999;
		document.body.appendChild(this.cord);

		let path = document.createElementNS(NS, 'path');
		path.setAttributeNS(null, 'd', d);
		path.setAttributeNS(null, 'stroke', 'silver');
		path.setAttributeNS(null, 'fill', 'none');
		this.cord.appendChild(path);
	}

	dispose() {
		this.svg?.remove();
		this.cord?.remove();
	}
}

export default class Bulbs {
	constructor(options = {}) {
		this.options = {
			interval: 50,
			bulb_size: 12,
			holder_size: 6,
			color_off: '#e0e0e0',
			frequency: 1000,
			colors: [
				'#ff4040',
				'#40f040',
				'#00ccff',
				'#ff60ff',
				'#40a0ff',
				'#ffcc40',
			]
		};
		this.options = { ...this.options, ...options };
		this.recreate();
		window.addEventListener('resize', this.#windowResizeHandler.bind(this));

	}

	recreate() {
		if (this.bulbs !== undefined) {
			this.stop();
			this.bulbs.forEach(bulb => bulb.dispose());
		}
		this.bulbs = [];
		let count = Math.floor(window.innerWidth / (this.options.interval + this.options.bulb_size));
		let offset = (window.innerWidth - count * this.options.bulb_size - (count - 1) * this.options.interval) / 2;

		let prev_center = 0;
		for (let i = 0; i < count; i++) {
			let left = offset + i * (this.options.interval + this.options.bulb_size);
			let center = left + this.options.bulb_size / 2;

			let bulb = new Bulb(this.options);
			bulb.left = left;
			if (i != 0)
				bulb.addCord(prev_center, center);
			this.bulbs.push(bulb);

			prev_center = center;
		}
		this.start();
	}

	start() {
		if (this.timer === undefined)
			this.timer = setInterval(() => {
				let colors = [...this.options.colors];
				colors.sort(() => Math.random() - 0.5);
				for (let i = 0; i < this.bulbs.length; i++)
					this.bulbs[i].color = colors[i % colors.length];
			}, this.options.frequency);
	}

	stop() {
		if (this.timer !== undefined) {
			clearInterval(this.timer);
			this.timer = undefined;
			for (let i = 0; i < this.bulbs.length; i++)
				this.bulbs[i].color = this.options.color_off;
		}
	}

	#windowResizeHandler() {
		this.recreate();
	}

	dispose() {
		this.stop();
		for (let i = 0; i < this.bulbs.length; i++)
			this.bulbs[i].dispose();
		window.removeEventListener('resize', this.#windowResizeHandler);
	}
}