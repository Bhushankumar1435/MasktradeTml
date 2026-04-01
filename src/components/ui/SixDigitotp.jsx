import { useRef } from "react";

export const OTPInput = ({ setOtp }) => {
  const inputs = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    inputs.current[index].value = value;

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }

    const otpValue = inputs.current
      .map((input) => input.value)
      .join("");

    setOtp(otpValue);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !inputs.current[index].value && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex gap-4 justify-center">
      {[...Array(6)].map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength="1"
          ref={(el) => (inputs.current[i] = el)}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="md:w-[60px] md:h-[60px] w-[35px] h-[35px] text-center text-[22px] rounded-xl bg-dark outline-none text-gray-800"
        />
      ))}
    </div>
  );
};