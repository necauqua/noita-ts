pub trait StringExt {
    fn split_balanced(&self, sep: char) -> Vec<String>;

    fn strip_parens_balanced(&self, open: char, close: char) -> Option<&str>;
}

impl StringExt for str {
    fn split_balanced(&self, sep: char) -> Vec<String> {
        let mut parts = Vec::new();

        let mut buf = String::new();

        let mut depth = 0;

        for ch in self.chars() {
            if ch == sep && depth == 0 {
                parts.push(std::mem::take(&mut buf));
                continue;
            }
            buf.push(ch);
            depth += match ch {
                '(' | '{' | '<' | '[' => 1,
                ')' | '}' | '>' | ']' => -1,
                _ => 0,
            };
        }
        if !buf.is_empty() {
            parts.push(buf);
        }

        parts
    }

    fn strip_parens_balanced(&self, open: char, close: char) -> Option<&str> {
        let mut chars = self.chars();
        if chars.next() != Some(open) || chars.next_back() != Some(close) {
            return None;
        }
        let mut depth = 0;
        for ch in chars {
            if ch == open {
                depth += 1;
            } else if ch == close {
                // negative depth means first paren got closed before the end
                if depth == 0 {
                    return None;
                }
                depth -= 1;
            }
        }
        Some(&self[open.len_utf8()..self.len() - close.len_utf8()])
    }
}
