import { DomainException } from "./domain.exception";

export class InvalidCredentialsException extends DomainException {
	readonly code = "INVALID_CREDENTIALS";
	readonly statusCode = 401;

	constructor(message: string = "Invalid email or password") {
		super(message);
	}
}
