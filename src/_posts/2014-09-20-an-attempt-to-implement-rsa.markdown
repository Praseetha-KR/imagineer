---
layout: post
title:  "An attempt to implement RSA Algorithm"
date:   2014-09-20 19:40:00
categories: blog
theme: "#234870"
masthead: "/assets/img/posts/encryption.jpg"
blurb: "Implementation of mock RSA algorithm in python"
---

Though we have studied [RSA algorithm][1] in college, it was just for the sake of theory examination. I never had thought about its practical implementation and how it is successfully existing over these many years. Here is an attempt to implement RSA encryption/decryption using python:

### Step 1:
Generate 2 distinct random prime numbers `p` and `q`

```python
p = generate_prime()
while True:
	q = generate_prime()
	if q != p:
		break
```

```python
# generate random prime function
def generate_prime():
	x = randint(100, 9999)
	while True:
		if is_prime(x):
			break
		else:
			x += 1
	return x

# primality check function
def is_prime(x):
	i = 2
	root = math.ceil(math.sqrt(x))
	while i <= root:
		if x % i == 0:
			return False
		i += 1
	return True
```

### Step 2:
Compute `n = pq`. n is used as the modulus for both the public and private keys. Its length is the *key length*.

```python
n = p * q
```

### Step 3:
Compute `φ(n) = φ(p)φ(q) = (p − 1)(q − 1)` where φ is [Euler's totient function][2].

```python
n1 = (p - 1) * (q - 1)
```

### Step 4:
Choose an integer e such that `1 < e < φ(n)` and `gcd(e, φ(n)) = 1`; i.e., e and φ(n) are coprime. e is released as the *public key exponent*.

```python
r = randint(2,100) # For efficiency 2 < e < 100
while True:
	if gcd(r, n1) == 1:
		break
	else:
		r += 1
e = r
```

```python
# function to find gcd
def gcd(a, b):
	while b:
		a, b = b, a%b
	return a
```

### Step 5:
Determine d as `d ≡ e−1 (mod φ(n))`; i.e., d is the [multiplicative inverse][3] of `e (modulo φ(n))`.

```python
d = modinv(e, n1)
```

modinv is calculated using Extended Euclidean Algorithm.

```python
# function to find modular inverse
def modinv(a,m):
	g,x,y = egcd(a,m)
	if g != 1:
		return None
	else:
		return x%m

# function to find extended gcd
def egcd(a, b):
	if a == 0:
		return (b, 0, 1)
	else:
		g, y, x = egcd(b % a, a)
		return (g, x - (b // a) * y, y)
```

### Step 6: Encryption
If 'm' is the message to be transmitted, it is encrypted as `c ≡ m^e * (mod n)` and c is send over network.

```python
c = (m**e) % n
```

### Step 7: Decryption
Upon recieving the encrypted message c, it is descrypted as `m ≡ c^d * (mod n)` to retrieve original message m.

```python
m = (c**d) % n
```

**********

## Practical limitations:
With my Macbook Pro of 4GB & Ci5 2.4GHz, to run this decryption function successfully,

+   The random primes generated `p` & `q` are kept below 10000.
+   Message to be encrypted `m`, which is entered via console, should be <= 4 digits.

As the size of the `p` and `q` increases, the value of `d` increases rapidly. Since the decryption function takes `d` as exponent, decryption becomes very time consuming process with my machine.

**********

Here is the complete python program:

```python
# coding=utf-8
from random import randint
import math

# generate random prime function
def generate_prime():
	x = randint(100, 9999)
	while True:
		if is_prime(x):
			break
		else:
			x += 1
	return x

# primality check function
def is_prime(x):
	i = 2
	root = math.ceil(math.sqrt(x))
	while i <= root:
		if x % i == 0:
			return False
		i += 1
	return True

# function to find gcd
def gcd(a, b):
	while b:
		a, b = b, a%b
	return a

# function to find extended gcd
def egcd(a, b):
	if a == 0:
		return (b, 0, 1)
	else:
		g, y, x = egcd(b % a, a)
		return (g, x - (b // a) * y, y)

# function to find modular inverse
def modinv(a,m):
	g,x,y = egcd(a,m)
	if g != 1:
		return None
	else:
		return x%m

if __name__ == "__main__":
	# choose 2 distinct primes p & q
	p = generate_prime()
	while True:
		q = generate_prime()
		if q != p:
			break
	print("p = %d" % p)
	print("q = %d" % q)

	# compute n = pq
	n = p * q

	# compute φ(n), where φ is the Euler's totient function
	n1 = (p - 1) * (q - 1)

	# Choose 1 < e < φ(n), which is coprime to φ(n)
	# e is public key exponent
	r = randint(2,100) # For efficiency 2 < e < 100
	while True:
		if gcd(r, n1) == 1:
				break
		else:
			r += 1
	e = r
	print("e = %d" % e)

	# Compute d, the modular multiplicative inverse of e
	# Private key exponent d
	d = modinv(e, n1)
	print("d = %d" % d)

	m = input("Enter message: ")

	# Encryption of m
	c = (m**e) % n
	print("Encrypted message = %d" % c)

	# Decryption of m
	m1 = (c**d) % n
	print("Decrypted message = %d" % m1)

```

[1]: http://en.wikipedia.org/wiki/RSA_(cryptosystem)
[2]: http://en.wikipedia.org/wiki/Euler%27s_totient_function
[3]: http://en.wikipedia.org/wiki/Modular_multiplicative_inverse
