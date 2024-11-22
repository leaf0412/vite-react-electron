export default {
  "extends": ["@commitlint/config-conventional"],
  "prompt": {
    "settings": {},
    "messages": {
      "skip": "非必填",
      "max": "最大不能超过 %d 个字符！",
      "min": "不少于 %d 个字符！",
      "emptyWarning": "不能为空！",
      "upperLimitWarning": "超过规定范围！",
      "lowerLimitWarning": "不符合规定范围！"
    },
    "questions": {
      "type": {
        "description": "选择要提交的更改类型：",
        "enum": {
          "feat": {
            "description": "【功能开发】：新功能、新特性",
            "title": "Features",
            "emoji": "✨"
          },
          "fix": {
            "description": "【问题修复】：bug漏洞、热修复",
            "title": "Bug Fixes",
            "emoji": "🐛"
          },
          "docs": {
            "description": "【文档维护】：项目描述文档，如：*.md",
            "title": "Documentation",
            "emoji": "📚"
          },
          "style": {
            "description": "【代码美化】：代码风格，如：单引号、换行、tab缩进",
            "title": "Styles",
            "emoji": "💎"
          },
          "refactor": {
            "description": "【代码重构】：代码重构，修改项目结构、变量、函数名，不影响业务",
            "title": "Code Refactoring",
            "emoji": "📦"
          },
          "perf": {
            "description": "【性能优化】：提升代码性能、减少内存占用",
            "title": "Performance Improvements",
            "emoji": "🚀"
          },
          "test": {
            "description": "【程序测试】：单元测试、测试用例",
            "title": "Tests",
            "emoji": "🚨"
          },
          "build": {
            "description": "【打包构建】：项目结构、依赖项",
            "title": "Builds",
            "emoji": "🛠"
          },
          "ci": {
            "description": "【集成流程】：自动化、持续集成、devops配置",
            "title": "Continuous Integrations",
            "emoji": "⚙️"
          },
          "chore": {
            "description": "【其他修改】：非业务代码修改，如：修改构建流程或者工具配置",
            "title": "Chores",
            "emoji": "♻️"
          },
          "revert": {
            "description": "【代码回滚】：恢复上一次提交",
            "title": "Reverts",
            "emoji": "🗑"
          }
        }
      },
      "scope": {
        "description": "变动范围, 比如: component, utils..."
      },
      "subject": {
        "description": "对变动部分, 描述说明"
      },
      "body": {
        "description": "对变动部分, 请具体描述说明"
      },
      "isBreaking": {
        "description": "是重大变动吗？"
      },
      "breakingBody": {
        "description": "针对重大变化，需要提交详细的描述"
      },
      "breaking": {
        "description": "对重大变化部分, 描述说明"
      },
      "isIssueAffected": {
        "description": "本次变动会影响 issues 问题？"
      },
      "issuesBody": {
        "description": "如果关闭 issues 问题, 请具体描述说明"
      },
      "issues": {
        "description": "创建 issues 问题, 比如: \"fix #123\", \"re #123\"..."
      }
    }
  }
}

