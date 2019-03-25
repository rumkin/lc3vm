export function toBin(value:number, length:number = 16): string {
    return group(value.toString(2).padStart(length, '0'));
}

export function fmt(value:string): string {
    return group(value.replace(/\s/g, '').padEnd(16, '0'));
}

export function group(value:string, count:number = 4) {
    const out = [];
    const chars = Array.from(value);
    let group = [];
    for (let i = 0; i < chars.length; i++) {
        group.push(chars[i]);
        if ((i + 1) % count === 0) {
            out.push(group.join(''));
            group = [];
        }
    }
    if (group.length) {
        out.push(group.join(''));
    }

    return out.join(' ');
}