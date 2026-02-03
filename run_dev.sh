#!/bin/bash
# Junpa Development Environment Runner
# Usage: ./run_dev.sh [command]
#
# Commands:
#   build    - Build the development container
#   start    - Start the development container (interactive)
#   shell    - Open a shell in running container
#   stop     - Stop the development container
#   clean    - Remove container and volumes
#   check    - Verify development tools installation
#   help     - Show this help message

set -e

COMPOSE_FILE="docker-compose.dev.yml"
CONTAINER_NAME="junpa-dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Junpa Development Environment${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

cmd_build() {
    print_header
    print_info "Building development container..."
    docker compose -f "$COMPOSE_FILE" build
    print_success "Development container built successfully!"
    echo ""
    print_info "Run './run_dev.sh start' to start the container"
}

cmd_start() {
    print_header
    print_info "Starting development container..."
    docker compose -f "$COMPOSE_FILE" up -d
    print_success "Container started!"
    echo ""
    print_info "Opening interactive shell..."
    docker exec -it "$CONTAINER_NAME" /bin/bash
}

cmd_shell() {
    print_header
    print_info "Connecting to development container..."
    docker exec -it "$CONTAINER_NAME" /bin/bash
}

cmd_stop() {
    print_header
    print_info "Stopping development container..."
    docker compose -f "$COMPOSE_FILE" down
    print_success "Container stopped!"
}

cmd_clean() {
    print_header
    print_warning "This will remove the container and all cached volumes."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose -f "$COMPOSE_FILE" down -v --rmi local
        print_success "Cleaned up successfully!"
    else
        print_info "Cancelled."
    fi
}

cmd_check() {
    print_header
    print_info "Checking development tools in container..."
    echo ""

    docker exec "$CONTAINER_NAME" bash -c '
        echo "=== Python Environment ==="
        python3 --version
        echo ""

        echo "=== Python LSP Servers ==="
        pyright --version 2>/dev/null && echo "✓ pyright installed" || echo "✗ pyright not found"
        pylsp --version 2>/dev/null && echo "✓ pylsp installed" || echo "✗ pylsp not found"
        echo ""

        echo "=== Python Tools ==="
        ruff --version 2>/dev/null && echo "✓ ruff installed" || echo "✗ ruff not found"
        mypy --version 2>/dev/null && echo "✓ mypy installed" || echo "✗ mypy not found"
        pytest --version 2>/dev/null && echo "✓ pytest installed" || echo "✗ pytest not found"
        uv --version 2>/dev/null && echo "✓ uv installed" || echo "✗ uv not found"
        echo ""

        echo "=== Node.js Environment ==="
        node --version
        npm --version
        echo ""

        echo "=== TypeScript LSP ==="
        typescript-language-server --version 2>/dev/null && echo "✓ typescript-language-server installed" || echo "✗ typescript-language-server not found"
        tsc --version 2>/dev/null && echo "✓ typescript installed" || echo "✗ typescript not found"
        echo ""

        echo "=== JavaScript Tools ==="
        eslint --version 2>/dev/null && echo "✓ eslint installed" || echo "✗ eslint not found"
        prettier --version 2>/dev/null && echo "✓ prettier installed" || echo "✗ prettier not found"
        biome --version 2>/dev/null && echo "✓ biome installed" || echo "✗ biome not found"
        echo ""

        echo "=== Code Analysis ==="
        sg --version 2>/dev/null && echo "✓ ast-grep installed" || echo "✗ ast-grep not found"
    '

    echo ""
    print_success "Check complete!"
}

cmd_help() {
    print_header
    echo ""
    echo "Usage: ./run_dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build    Build the development container"
    echo "  start    Start the development container (interactive)"
    echo "  shell    Open a shell in running container"
    echo "  stop     Stop the development container"
    echo "  clean    Remove container and volumes"
    echo "  check    Verify development tools installation"
    echo "  help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./run_dev.sh build   # First time setup"
    echo "  ./run_dev.sh start   # Start and enter container"
    echo "  ./run_dev.sh check   # Verify tools are installed"
    echo ""
}

# Main entry point
case "${1:-help}" in
    build)
        cmd_build
        ;;
    start)
        cmd_start
        ;;
    shell)
        cmd_shell
        ;;
    stop)
        cmd_stop
        ;;
    clean)
        cmd_clean
        ;;
    check)
        cmd_check
        ;;
    help|--help|-h)
        cmd_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        cmd_help
        exit 1
        ;;
esac
