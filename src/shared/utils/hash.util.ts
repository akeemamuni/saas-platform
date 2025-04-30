import * as bcrypt from 'bcrypt';

// Utility functions to hash and verify password
export async function hashValue(value: string) {
    return await bcrypt.hash(value, 10)
}

export async function verifyValue(value: string, hash: string) {
    return await bcrypt.compare(value, hash)
}
